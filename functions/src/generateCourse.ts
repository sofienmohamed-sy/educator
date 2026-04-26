import Anthropic from "@anthropic-ai/sdk";
import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { defineSecret } from "firebase-functions/params";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/v2";

import { generateWithClaude } from "./claude";
import { getCurriculumProfile } from "./curriculum";
import { buildCoursePrompt, buildRagContextBlock } from "./prompts";
import { enforceRateLimit } from "./rateLimit";
import { searchRelevantChunks, fetchStyleChunks } from "./rag";
import {
  generateCourseRequestSchema,
  courseSchema,
  type GenerateCourseRequest,
  type Course,
} from "./schema";

if (getApps().length === 0) initializeApp();

const ANTHROPIC_API_KEY = defineSecret("ANTHROPIC_API_KEY");
const GCP_PROJECT_ID = defineSecret("GCP_PROJECT_ID");

export const generateCourse = onCall(
  {
    region: "us-central1",
    secrets: [ANTHROPIC_API_KEY, GCP_PROJECT_ID],
    memory: "512MiB",
    timeoutSeconds: 300,
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Sign in required.");
    }
    const uid = request.auth.uid;

    const parsed = generateCourseRequestSchema.safeParse(request.data);
    if (!parsed.success) {
      throw new HttpsError(
        "invalid-argument",
        `Invalid request: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`,
      );
    }
    const req: GenerateCourseRequest = parsed.data;

    await enforceRateLimit(uid, "generateCourse", 10);

    const profile = await getCurriculumProfile(req.country, req.subject, req.gradeLevel, req.section);

    let ragContext = "";
    if (req.bookIds?.length) {
      const [contentChunks, styleChunks] = await Promise.all([
        searchRelevantChunks(req.topic, req.bookIds, GCP_PROJECT_ID.value(), 20),
        fetchStyleChunks(req.bookIds, GCP_PROJECT_ID.value()),
      ]);
      ragContext = buildRagContextBlock(contentChunks, styleChunks);
    }

    const systemPrompt = buildCoursePrompt({
      subject: req.subject,
      topic: req.topic,
      section: req.section,
      country: req.country,
      gradeLevel: req.gradeLevel,
      language: req.language,
      profile,
      ragContext,
    });

    const apiKey = ANTHROPIC_API_KEY.value().trim();
    if (!apiKey) {
      throw new HttpsError("failed-precondition", "ANTHROPIC_API_KEY is not configured.");
    }

    let course: Course;
    try {
      course = await generateWithClaude({
        apiKey,
        systemPrompt,
        userMessage: `Generate a complete course lesson on "${req.topic}" for ${req.subject} at ${req.country}${req.gradeLevel ? ` ${req.gradeLevel}` : ""} level. Return only the JSON object.`,
        schema: courseSchema,
      });
    } catch (err) {
      const payload: Record<string, unknown> = { uid };
      if (err instanceof Error) { payload.message = err.message; payload.stack = err.stack; }
      if (err instanceof Anthropic.APIError) { payload.status = err.status; }
      logger.error("Claude course generation failed", payload);
      const detail =
        err instanceof Anthropic.APIError
          ? `Anthropic API ${err.status}: ${err.message}`
          : err instanceof Error ? err.message : String(err);
      throw new HttpsError("internal", `Failed to generate course: ${detail}`);
    }

    const ref = await getFirestore()
      .collection("users")
      .doc(uid)
      .collection("courses")
      .add({
        createdAt: FieldValue.serverTimestamp(),
        subject: req.subject,
        topic: req.topic,
        country: req.country,
        gradeLevel: req.gradeLevel ?? null,
        language: req.language ?? null,
        bookIds: req.bookIds ?? [],
        course,
      });

    return { id: ref.id, course };
  },
);
