import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { defineSecret } from "firebase-functions/params";
import { HttpsError, onCall } from "firebase-functions/v2/https";

import { generateWithClaude } from "./claude";
import { getCurriculumProfile } from "./curriculum";
import { buildWritingGenerationPrompt } from "./prompts";
import { enforceRateLimit } from "./rateLimit";
import {
  generateWritingRequestSchema,
  writingContentSchema,
  type GenerateWritingRequest,
  type WritingContent,
} from "./schema";

if (getApps().length === 0) initializeApp();

const ANTHROPIC_API_KEY = defineSecret("ANTHROPIC_API_KEY");

export const generateWriting = onCall(
  {
    region: "us-central1",
    secrets: [ANTHROPIC_API_KEY],
    memory: "512MiB",
    timeoutSeconds: 300,
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Sign in required.");
    }
    const uid = request.auth.uid;

    const parsed = generateWritingRequestSchema.safeParse(request.data);
    if (!parsed.success) {
      throw new HttpsError(
        "invalid-argument",
        `Invalid request: ${parsed.error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join("; ")}`,
      );
    }
    const req: GenerateWritingRequest = parsed.data;

    await enforceRateLimit(uid, "generateWriting", 10);

    const profile = await getCurriculumProfile(req.country, undefined, req.gradeLevel, req.section);

    const systemPrompt = buildWritingGenerationPrompt({
      writingSubject: req.writingSubject,
      contentType: req.contentType,
      topic: req.topic,
      country: req.country,
      gradeLevel: req.gradeLevel,
      section: req.section,
      language: req.language,
      difficulty: req.difficulty,
      count: req.count ?? 5,
      profile,
    });

    const apiKey = ANTHROPIC_API_KEY.value().trim();
    if (!apiKey) {
      throw new HttpsError(
        "failed-precondition",
        "ANTHROPIC_API_KEY is not configured.",
      );
    }

    let content: WritingContent;
    try {
      content = await generateWithClaude({
        apiKey,
        systemPrompt,
        userMessage: `Generate ${req.contentType} content on "${req.topic}" for ${req.writingSubject} at ${req.country}${req.gradeLevel ? ` ${req.gradeLevel}` : ""} level. Return only the JSON object.`,
        schema: writingContentSchema,
      });
    } catch {
      throw new HttpsError("internal", "Failed to generate writing content.");
    }

    const ref = await getFirestore()
      .collection("users")
      .doc(uid)
      .collection("writingContent")
      .add({
        createdAt: FieldValue.serverTimestamp(),
        writingSubject: req.writingSubject,
        contentType: req.contentType,
        topic: req.topic,
        country: req.country,
        gradeLevel: req.gradeLevel ?? null,
        language: req.language ?? null,
        difficulty: req.difficulty ?? null,
        count: req.count ?? 5,
        content,
      });

    return { id: ref.id, content };
  },
);
