import Anthropic from "@anthropic-ai/sdk";
import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { defineSecret } from "firebase-functions/params";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/v2";

import { solveWithClaude } from "./claude";
import { getCurriculumProfile } from "./curriculum";
import { buildSystemPrompt } from "./prompts";
import { solveRequestSchema, type SolveRequest } from "./schema";

if (getApps().length === 0) initializeApp();

const ANTHROPIC_API_KEY = defineSecret("ANTHROPIC_API_KEY");

/** Simple per-user rate limit: max 30 solves per rolling hour. */
const RATE_LIMIT_PER_HOUR = 30;

export const solveProblem = onCall(
  {
    region: "us-central1",
    secrets: [ANTHROPIC_API_KEY],
    memory: "512MiB",
    timeoutSeconds: 120,
    // Require App Check in production; leave enforcement off for emulator.
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

    await enforceRateLimit(uid);

    // Load curriculum profile if seeded; otherwise fall back to Claude knowledge.
    const profile = await getCurriculumProfile(req.country);

    const systemPrompt = buildSystemPrompt({
      country: req.country,
      gradeLevel: req.gradeLevel,
      language: req.language,
      profile,
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
      throw new HttpsError("internal", "Failed to generate a solution.");
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
        model: req.model ?? "claude-opus-4-6",
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

async function enforceRateLimit(uid: string): Promise<void> {
  const db = getFirestore();
  const ref = db.collection("users").doc(uid).collection("_meta").doc("rate");
  const now = Date.now();
  const windowStart = now - 60 * 60 * 1000;

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const existing = (snap.data()?.solves as number[] | undefined) ?? [];
    const recent = existing.filter((t) => t >= windowStart);
    if (recent.length >= RATE_LIMIT_PER_HOUR) {
      throw new HttpsError(
        "resource-exhausted",
        `Rate limit reached: ${RATE_LIMIT_PER_HOUR} solves per hour.`,
      );
    }
    recent.push(now);
    tx.set(ref, { solves: recent }, { merge: true });
  });
}
