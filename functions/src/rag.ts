import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { logger } from "firebase-functions/v2";
import type { RagChunk } from "./schema";

const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 100;
const EMBEDDING_DIMENSION = 768;
const TOP_K = 5;
const VERTEX_LOCATION = "us-central1";

// ── Text chunking ─────────────────────────────────────────────────────────────

export function chunkText(
  text: string,
): Array<{ text: string; chunkIndex: number }> {
  if (!text.trim()) return [];

  const chunks: Array<{ text: string; chunkIndex: number }> = [];
  let start = 0;
  let index = 0;

  while (start < text.length) {
    let end = start + CHUNK_SIZE;

    if (end < text.length) {
      // Try to break at a sentence or paragraph boundary within the last 200 chars
      const window = text.slice(Math.max(start, end - 200), end);
      const breakMatch = window.match(/[.!?\n]\s+/gu);
      if (breakMatch) {
        const lastBreak = window.lastIndexOf(
          breakMatch[breakMatch.length - 1],
        );
        end = Math.max(start, end - 200) + lastBreak + 1;
      }
    }

    const chunk = text.slice(start, Math.min(end, text.length)).trim();
    if (chunk.length > 0) {
      chunks.push({ text: chunk, chunkIndex: index++ });
    }

    start = end - CHUNK_OVERLAP;
    if (start >= text.length) break;
  }

  return chunks;
}

// ── Vertex AI embeddings ──────────────────────────────────────────────────────

// Dynamic import so unit tests can mock without loading the heavy SDK
async function getVertexClient() {
  const { PredictionServiceClient } = await import(
    "@google-cloud/aiplatform"
  ).then((m) => m.v1);
  return new PredictionServiceClient({
    apiEndpoint: `${VERTEX_LOCATION}-aiplatform.googleapis.com`,
  });
}

async function embedTextRaw(
  projectId: string,
  text: string,
): Promise<number[]> {
  const vertexClient = await getVertexClient();
  const endpoint = `projects/${projectId}/locations/${VERTEX_LOCATION}/publishers/google/models/text-embedding-004`;

  const [response] = await (vertexClient as unknown as { predict(req: unknown): Promise<unknown[]> }).predict({
    endpoint,
    instances: [
      {
        structValue: {
          fields: {
            content: { stringValue: text.slice(0, 2048) },
            task_type: { stringValue: "RETRIEVAL_DOCUMENT" },
          },
        },
      },
    ],
    parameters: {
      structValue: {
        fields: {
          outputDimensionality: { numberValue: EMBEDDING_DIMENSION },
        },
      },
    },
  });

  // Navigate the protobuf struct response; cast to a typed accessor
  type VertexResponse = {
    predictions?: Array<{
      structValue?: {
        fields?: {
          embeddings?: {
            structValue?: {
              fields?: {
                values?: {
                  listValue?: {
                    values?: Array<{ numberValue?: number }>;
                  };
                };
              };
            };
          };
        };
      };
    }>;
  };
  const typed = response as VertexResponse;
  const values: number[] =
    typed?.predictions?.[0]?.structValue?.fields?.embeddings?.structValue
      ?.fields?.values?.listValue?.values?.map(
        (v) => v.numberValue ?? 0,
      ) ?? [];

  if (values.length !== EMBEDDING_DIMENSION) {
    throw new Error(
      `Unexpected embedding dimension: ${values.length} (expected ${EMBEDDING_DIMENSION})`,
    );
  }

  return values;
}

export async function embedText(
  projectId: string,
  text: string,
  timeoutMs = 20_000,
): Promise<number[]> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(
      () => reject(new Error(`Vertex AI embedText timed out after ${timeoutMs}ms`)),
      timeoutMs,
    ),
  );
  return Promise.race([embedTextRaw(projectId, text), timeout]);
}

// ── Store chunks with embeddings ──────────────────────────────────────────────

export async function storeChunks(
  bookId: string,
  chunks: Array<{ text: string; chunkIndex: number; pageHint?: number }>,
  projectId: string,
): Promise<void> {
  const db = getFirestore();
  const BATCH_SIZE = 400;

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const slice = chunks.slice(i, i + BATCH_SIZE);

    await Promise.all(
      slice.map(async (chunk) => {
        let embedding: number[];
        try {
          embedding = await embedText(projectId, chunk.text);
        } catch (err) {
          logger.warn("Embedding failed for chunk, using zeros", {
            bookId,
            chunkIndex: chunk.chunkIndex,
            err,
          });
          embedding = new Array(EMBEDDING_DIMENSION).fill(0);
        }

        const ref = db
          .collection("books")
          .doc(bookId)
          .collection("chunks")
          .doc(String(chunk.chunkIndex));

        batch.set(ref, {
          bookId,
          chunkIndex: chunk.chunkIndex,
          text: chunk.text,
          ...(chunk.pageHint !== undefined ? { pageHint: chunk.pageHint } : {}),
          embedding: FieldValue.vector(embedding),
        });
      }),
    );

    await batch.commit();
    logger.info(`Stored chunks ${i}–${i + slice.length - 1} for book ${bookId}`);
  }
}

// ── Vector search ─────────────────────────────────────────────────────────────

async function doSearchRelevantChunks(
  query: string,
  bookIds: string[],
  projectId: string,
): Promise<RagChunk[]> {
  let queryEmbedding: number[];
  try {
    queryEmbedding = await embedText(projectId, query);
  } catch (err) {
    logger.warn("Failed to embed query for RAG search, returning no chunks", { err });
    return [];
  }

  const db = getFirestore();
  const results: Array<{ text: string; bookId: string; pageHint?: number; distance: number }> = [];

  await Promise.all(
    bookIds.slice(0, 5).map(async (bookId) => {
      try {
        const vectorQuery = db
          .collection("books")
          .doc(bookId)
          .collection("chunks")
          .findNearest({
            vectorField: "embedding",
            queryVector: FieldValue.vector(queryEmbedding),
            limit: TOP_K,
            distanceMeasure: "COSINE",
            distanceResultField: "_distance",
          });

        const snap = await vectorQuery.get();
        for (const doc of snap.docs) {
          const data = doc.data();
          results.push({
            text: data.text as string,
            bookId,
            pageHint: data.pageHint as number | undefined,
            distance: (data._distance as number | undefined) ?? 1,
          });
        }
      } catch (err) {
        logger.warn("Vector search failed for book", { bookId, err });
      }
    }),
  );

  results.sort((a, b) => a.distance - b.distance);
  const top = results.slice(0, TOP_K);

  const uniqueBookIds = [...new Set(top.map((r) => r.bookId))];
  const bookTitles: Record<string, string> = {};
  await Promise.all(
    uniqueBookIds.map(async (id) => {
      const snap = await db.collection("books").doc(id).get();
      bookTitles[id] = (snap.data()?.title as string | undefined) ?? id;
    }),
  );

  return top.map((r) => ({
    text: r.text,
    bookTitle: bookTitles[r.bookId] ?? r.bookId,
    ...(r.pageHint !== undefined ? { pageHint: r.pageHint } : {}),
  }));
}

export async function searchRelevantChunks(
  query: string,
  bookIds: string[],
  projectId: string,
  timeoutMs = 30_000,
): Promise<RagChunk[]> {
  if (!bookIds.length || !query.trim()) return [];

  const timeout = new Promise<RagChunk[]>((resolve) =>
    setTimeout(() => {
      logger.warn("searchRelevantChunks timed out, proceeding without RAG context");
      resolve([]);
    }, timeoutMs),
  );

  return Promise.race([doSearchRelevantChunks(query, bookIds, projectId), timeout]);
}
