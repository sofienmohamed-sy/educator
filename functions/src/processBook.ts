import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { defineSecret } from "firebase-functions/params";
import { onObjectFinalized } from "firebase-functions/v2/storage";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/v2";
import { chunkText, storeChunks } from "./rag";
import { processBookRequestSchema } from "./schema";

if (getApps().length === 0) initializeApp();

const GCP_PROJECT_ID = defineSecret("GCP_PROJECT_ID");

async function assertProfessor(uid: string): Promise<void> {
  const snap = await getFirestore().collection("users").doc(uid).get();
  if (snap.data()?.role !== "professor") {
    throw new HttpsError("permission-denied", "Professor role required.");
  }
}

async function runProcessBook(
  bookId: string,
  storagePath: string,
  projectId: string,
): Promise<void> {
  const db = getFirestore();
  const bookRef = db.collection("books").doc(bookId);

  await bookRef.update({
    status: "processing",
    updatedAt: FieldValue.serverTimestamp(),
  });

  try {
    const [bytes] = await getStorage().bucket().file(storagePath).download();
    const { default: pdfParse } = await import("pdf-parse");
    const { text } = await pdfParse(bytes);
    const chunks = chunkText(text);

    // Delete existing chunks (handles re-processing case)
    const existing = await db
      .collection("books")
      .doc(bookId)
      .collection("chunks")
      .listDocuments();
    if (existing.length > 0) {
      const deleteBatch = db.batch();
      existing.forEach((ref) => deleteBatch.delete(ref));
      await deleteBatch.commit();
    }

    await storeChunks(bookId, chunks, projectId);

    await bookRef.update({
      status: "ready",
      chunkCount: chunks.length,
      updatedAt: FieldValue.serverTimestamp(),
    });

    logger.info("Book processed successfully", { bookId, chunkCount: chunks.length });
  } catch (err) {
    logger.error("processBook failed", { bookId, err });
    await bookRef.update({
      status: "error",
      errorMessage: err instanceof Error ? err.message : String(err),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }
}

/** Storage trigger: fires when a file lands in the default bucket. */
export const processBookOnUpload = onObjectFinalized(
  {
    region: "us-central1",
    secrets: [GCP_PROJECT_ID],
    memory: "1GiB",
    timeoutSeconds: 540,
  },
  async (event) => {
    const path = event.data.name;
    // Only handle books/{bookId}/original.pdf
    const match = path.match(/^books\/([^/]+)\/original\.pdf$/u);
    if (!match) return;

    const bookId = match[1];
    logger.info("Processing uploaded book", { bookId, path });
    await runProcessBook(bookId, path, GCP_PROJECT_ID.value());
  },
);

/** Callable: professor can manually re-trigger processing (e.g., after an error). */
export const processBook = onCall(
  {
    region: "us-central1",
    secrets: [GCP_PROJECT_ID],
    memory: "1GiB",
    timeoutSeconds: 540,
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Sign in required.");
    }
    await assertProfessor(request.auth.uid);

    const parsed = processBookRequestSchema.safeParse(request.data);
    if (!parsed.success) {
      throw new HttpsError(
        "invalid-argument",
        `Invalid request: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`,
      );
    }

    const db = getFirestore();
    const bookSnap = await db.collection("books").doc(parsed.data.bookId).get();
    if (!bookSnap.exists) {
      throw new HttpsError("not-found", "Book not found.");
    }
    const bookData = bookSnap.data()!;
    if (bookData.uploadedBy !== request.auth.uid) {
      throw new HttpsError(
        "permission-denied",
        "Only the uploader may re-process a book.",
      );
    }

    await runProcessBook(
      parsed.data.bookId,
      bookData.storagePath as string,
      GCP_PROJECT_ID.value(),
    );
    return { ok: true };
  },
);
