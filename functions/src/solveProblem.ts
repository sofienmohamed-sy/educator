import Anthropic from "@anthropic-ai/sdk";
import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { defineSecret } from "firebase-functions/params";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/v2";

import { solveWithClaude } from "./claude";
import { getCurriculumProfile } from "./curriculum";
import { buildSystemPrompt, buildRagContextBlock } from "./prompts";
import { enforceRateLimit } from "./rateLimit";
import { searchRelevantChunks, fetchStyleChunks } from "./rag";
import { solveRequestSchema, type SolveRequest } from "./schema";

if (getApps().length === 0) initializeApp();

const ANTHROPIC_API_KEY = defineSecret("ANTHROPIC_API_KEY");
const GCP_PROJECT_ID = defineSecret("GCP_PROJECT_ID");

export const solveProblem = onCall(
  {
    region: "us-central1",
    secrets: [ANTHROPIC_API_KEY, GCP_PROJECT_ID],
    memory: "512MiB",
    timeoutSeconds: 120,
    enforceAppCheck: false,
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Sign in required.");
    }
    const uid = request.auth.uid;

    const parsed = solveRequestSchema.safeParse(request.data);
    if (!parsed.success) {
      throw new HttpsError(
        "invalid-argument",
        `Invalid request: ${parsed.error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join("; ")}`,
      );
    }
    const req: SolveRequest = parsed.data;

    await enforceRateLimit(uid, "solve", 30);

    const profile = await getCurriculumProfile(req.country, req.subject);

    let ragContext = "";
    if (req.bookIds?.length) {
      const query =
        req.input.kind === "text"
          ? req.input.text.slice(0, 500)
          : `${req.subject ?? "science"} problem`;
      const [contentChunks, styleChunks] = await Promise.all([
        searchRelevantChunks(query, req.bookIds, GCP_PROJECT_ID.value()),
        fetchStyleChunks(req.bookIds, GCP_PROJECT_ID.value()),
      ]);
      ragContext = buildRagContextBlock(contentChunks, styleChunks);
    }

    const systemPrompt = buildSystemPrompt({
      country: req.country,
      gradeLevel: req.gradeLevel,
      language: req.language,
      subject: req.subject,
      profile,
      ragContext,
    });

    // Fetch the uploaded file, if any.
    let fileBytes: Buffer | undefined;
    let fileContentType: string | undefined;
    if (req.input.kind === "storage") {
      if (!req.input.path.startsWith(`uploads/${uid}/`)) {
        throw new HttpsError(
          "permission-denied",
          "You can only solve problems from your own uploads.",
        );
      }
      const bucket = getStorage().bucket();
      const file = bucket.file(req.input.path);
      const [meta] = await file.getMetadata().catch(() => [null] as const);
      if (!meta) {
        throw new HttpsError("not-found", "Uploaded file was not found.");
      }
      fileContentType = req.input.contentType;
      const [bytes] = await file.download();
      fileBytes = bytes;
    }

    // Trim defensively: Secret Manager values created from a shell pipeline
    // can pick up a trailing newline, which makes the key invalid.
    const apiKey = ANTHROPIC_API_KEY.value().trim();
    if (!apiKey) {
      throw new HttpsError(
        "failed-precondition",
        "ANTHROPIC_API_KEY is not configured.",
      );
    }

    let solution;
    try {
      solution = await solveWithClaude({
        apiKey,
        model: req.model,
        systemPrompt,
        input: req.input,
        fileBytes,
        fileContentType,
      });
    } catch (err) {
      const payload: Record<string, unknown> = { uid };
      if (err instanceof Error) {
        payload.message = err.message;
        payload.name = err.name;
        payload.stack = err.stack;
      }
      if (err instanceof Anthropic.APIError) {
        payload.status = err.status;
        payload.type = err.error?.type;
        payload.requestId = err.headers?.["request-id"];
      }
      logger.error("Claude invocation failed", payload);
      const detail =
        err instanceof Anthropic.APIError
          ? `Anthropic API ${err.status}: ${err.message}`
          : err instanceof Error
            ? err.message
            : String(err);
      throw new HttpsError("internal", `Failed to generate a solution: ${detail}`);
    }

    // Persist for the student's history.
    const problemRef = await getFirestore()
      .collection("users")
      .doc(uid)
      .collection("problems")
      .add({
        createdAt: FieldValue.serverTimestamp(),
        country: req.country,
        gradeLevel: req.gradeLevel ?? null,
        language: req.language ?? null,
        model: req.model ?? "claude-sonnet-4-6",
        usedCuratedCurriculum: Boolean(profile),
        input:
          req.input.kind === "text"
            ? { kind: "text", text: req.input.text }
            : {
                kind: "storage",
                path: req.input.path,
                contentType: req.input.contentType,
              },
        solution,
      });

    return { id: problemRef.id, solution, usedCuratedCurriculum: Boolean(profile) };
  },
);

