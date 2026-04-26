import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { defineSecret } from "firebase-functions/params";
import { HttpsError, onCall } from "firebase-functions/v2/https";

import { generateWithClaude } from "./claude";
import { getCurriculumProfile } from "./curriculum";
import { buildExercisesPrompt, buildRagContextBlock } from "./prompts";
import { enforceRateLimit } from "./rateLimit";
import { searchRelevantChunks, fetchStyleChunks } from "./rag";
import {
  generateExercisesRequestSchema,
  exercisesResponseSchema,
  type GenerateExercisesRequest,
  type Exercise,
} from "./schema";

if (getApps().length === 0) initializeApp();

const ANTHROPIC_API_KEY = defineSecret("ANTHROPIC_API_KEY");
const GCP_PROJECT_ID = defineSecret("GCP_PROJECT_ID");

export const generateExercises = onCall(
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

    const parsed = generateExercisesRequestSchema.safeParse(request.data);
    if (!parsed.success) {
      throw new HttpsError(
        "invalid-argument",
        `Invalid request: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`,
      );
    }
    const req: GenerateExercisesRequest = parsed.data;

    await enforceRateLimit(uid, "generateExercises", 20);

    const profile = await getCurriculumProfile(req.country, req.subject, req.gradeLevel, req.section);

    let ragContext = "";
    if (req.bookIds?.length) {
      const [contentChunks, styleChunks] = await Promise.all([
        searchRelevantChunks(`exercice problème ${req.topic}`, req.bookIds, GCP_PROJECT_ID.value(), 20),
        fetchStyleChunks(req.bookIds, GCP_PROJECT_ID.value()),
      ]);
      ragContext = buildRagContextBlock(contentChunks, styleChunks);
    }

    const systemPrompt = buildExercisesPrompt({
      subject: req.subject,
      topic: req.topic,
      section: req.section,
      difficulty: req.difficulty,
      count: req.count,
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

    let exercises: Exercise[];
    try {
      const result = await generateWithClaude({
        apiKey,
        systemPrompt,
        userMessage: `Generate ${req.count} ${req.difficulty}-difficulty ${req.subject} exercise(s) on "${req.topic}". Return only the JSON object.`,
        schema: exercisesResponseSchema,
      });
      exercises = result.exercises;
    } catch {
      throw new HttpsError("internal", "Failed to generate exercises.");
    }

    const ref = await getFirestore()
      .collection("users")
      .doc(uid)
      .collection("exercises")
      .add({
        createdAt: FieldValue.serverTimestamp(),
        subject: req.subject,
        topic: req.topic,
        difficulty: req.difficulty,
        count: req.count,
        country: req.country,
        gradeLevel: req.gradeLevel ?? null,
        language: req.language ?? null,
        bookIds: req.bookIds ?? [],
        exercises,
      });

    return { id: ref.id, exercises };
  },
);
