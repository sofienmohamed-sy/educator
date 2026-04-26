import Anthropic from "@anthropic-ai/sdk";
import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { defineSecret } from "firebase-functions/params";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/v2";

import { analyzeWithClaude } from "./claude";
import { getCurriculumProfile } from "./curriculum";
import {
  buildWritingAnalysisPrompt,
  WRITING_USER_INSTRUCTION_FOR_TEXT,
  WRITING_USER_INSTRUCTION_FOR_IMAGE,
  WRITING_USER_INSTRUCTION_FOR_PDF,
} from "./prompts";
import { enforceRateLimit } from "./rateLimit";
import {
  solveWritingRequestSchema,
  writingAnalysisSchema,
  type SolveWritingRequest,
} from "./schema";

if (getApps().length === 0) initializeApp();

const ANTHROPIC_API_KEY = defineSecret("ANTHROPIC_API_KEY");

export const solveWriting = onCall(
  {
    region: "us-central1",
    secrets: [ANTHROPIC_API_KEY],
    memory: "512MiB",
    timeoutSeconds: 120,
    enforceAppCheck: false,
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Sign in required.");
    }
    const uid = request.auth.uid;

    const parsed = solveWritingRequestSchema.safeParse(request.data);
    if (!parsed.success) {
      throw new HttpsError(
        "invalid-argument",
        `Invalid request: ${parsed.error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join("; ")}`,
      );
    }
    const req: SolveWritingRequest = parsed.data;

    await enforceRateLimit(uid, "solveWriting", 30);

    const profile = await getCurriculumProfile(req.country, undefined, req.gradeLevel, req.section);

    const systemPrompt = buildWritingAnalysisPrompt({
      country: req.country,
      gradeLevel: req.gradeLevel,
      section: req.section,
      language: req.language,
      writingSubject: req.writingSubject,
      profile,
    });

    let fileBytes: Buffer | undefined;
    let fileContentType: string | undefined;
    if (req.input.kind === "storage") {
      if (!req.input.path.startsWith(`uploads/${uid}/`)) {
        throw new HttpsError(
          "permission-denied",
          "You can only analyze writing from your own uploads.",
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

    const apiKey = ANTHROPIC_API_KEY.value().trim();
    if (!apiKey) {
      throw new HttpsError(
        "failed-precondition",
        "ANTHROPIC_API_KEY is not configured.",
      );
    }

    let analysis;
    try {
      analysis = await analyzeWithClaude({
        apiKey,
        model: req.model,
        systemPrompt,
        input: req.input,
        fileBytes,
        fileContentType,
        schema: writingAnalysisSchema,
        instructions: {
          forText: WRITING_USER_INSTRUCTION_FOR_TEXT,
          forImage: WRITING_USER_INSTRUCTION_FOR_IMAGE,
          forPdf: WRITING_USER_INSTRUCTION_FOR_PDF,
        },
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
      logger.error("Claude writing analysis failed", payload);
      throw new HttpsError("internal", "Failed to generate writing analysis.");
    }

    const docRef = await getFirestore()
      .collection("users")
      .doc(uid)
      .collection("writingProblems")
      .add({
        createdAt: FieldValue.serverTimestamp(),
        country: req.country,
        gradeLevel: req.gradeLevel ?? null,
        language: req.language ?? null,
        writingSubject: req.writingSubject,
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
        analysis,
      });

    return { id: docRef.id, analysis, usedCuratedCurriculum: Boolean(profile) };
  },
);
