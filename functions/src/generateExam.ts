import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { defineSecret } from "firebase-functions/params";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/v2";

import { generateWithClaude, MAX_TOKENS_EXAM } from "./claude";
import { getCurriculumProfile } from "./curriculum";
import { buildExamPrompt, buildRagContextBlock } from "./prompts";
import { enforceRateLimit } from "./rateLimit";
import { searchRelevantChunks, fetchStyleChunks } from "./rag";
import {
  generateExamRequestSchema,
  examSchema,
  type GenerateExamRequest,
  type Exam,
} from "./schema";

if (getApps().length === 0) initializeApp();

const ANTHROPIC_API_KEY = defineSecret("ANTHROPIC_API_KEY");
const GCP_PROJECT_ID = defineSecret("GCP_PROJECT_ID");

/**
 * Validates the 60/20/20 distribution of subpart types within each exercise.
 * Direct helpers = 60%, indirect helpers = 20%, synthesis (objective) = 20%.
 * Returns an error string or null if valid.
 */
export function validateExamDistribution(
  exam: Exam,
  totalPoints: number,
): string | null {
  if (exam.exercises.length !== 4) {
    return `Exam has ${exam.exercises.length} exercises; exactly 4 are required.`;
  }

  const sum = exam.exercises.reduce((acc, e) => acc + e.totalPoints, 0);
  if (Math.abs(sum - totalPoints) > 0.01) {
    return `Point sum ${sum} does not equal ${totalPoints}.`;
  }

  for (const exercise of exam.exercises) {
    const allSubparts = exercise.parts.flatMap((p) => p.subparts);
    const exercisePts = allSubparts.reduce((s, sp) => s + sp.points, 0);
    if (exercisePts === 0) continue;

    const directPts = allSubparts.filter((sp) => sp.type === "direct").reduce((s, sp) => s + sp.points, 0);
    const indirectPts = allSubparts.filter((sp) => sp.type === "indirect").reduce((s, sp) => s + sp.points, 0);
    const synthPts = allSubparts.filter((sp) => sp.type === "synthesis").reduce((s, sp) => s + sp.points, 0);

    const directRatio = directPts / exercisePts;
    const indirectRatio = indirectPts / exercisePts;
    const synthRatio = synthPts / exercisePts;

    if (Math.abs(directRatio - 0.6) > 0.15) {
      return `${exercise.title}: direct subparts ratio ${(directRatio * 100).toFixed(0)}% is not ~60%.`;
    }
    if (Math.abs(indirectRatio - 0.2) > 0.15) {
      return `${exercise.title}: indirect subparts ratio ${(indirectRatio * 100).toFixed(0)}% is not ~20%.`;
    }
    if (Math.abs(synthRatio - 0.2) > 0.15) {
      return `${exercise.title}: synthesis subparts ratio ${(synthRatio * 100).toFixed(0)}% is not ~20%.`;
    }
  }

  return null;
}

export const generateExam = onCall(
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

    const parsed = generateExamRequestSchema.safeParse(request.data);
    if (!parsed.success) {
      throw new HttpsError(
        "invalid-argument",
        `Invalid request: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`,
      );
    }
    const req: GenerateExamRequest = parsed.data;

    await enforceRateLimit(uid, "generateExam", 5);

    const profile = await getCurriculumProfile(req.country, req.subject, req.gradeLevel, req.section);

    let ragContext = "";
    if (req.bookIds?.length) {
      const [contentChunks, styleChunks] = await Promise.all([
        searchRelevantChunks(`exercice problème ${req.topics.join(", ")}`, req.bookIds, GCP_PROJECT_ID.value(), 20),
        fetchStyleChunks(req.bookIds, GCP_PROJECT_ID.value()),
      ]);
      ragContext = buildRagContextBlock(contentChunks, styleChunks);
    }

    const systemPrompt = buildExamPrompt({
      subject: req.subject,
      topics: req.topics,
      section: req.section,
      totalPoints: req.totalPoints,
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

    const userMessage = `Create a ${req.subject} exam on: ${req.topics.join(", ")}. Total points: ${req.totalPoints}. Return only the JSON object.`;

    let exam: Exam;
    try {
      exam = await generateWithClaude({
        apiKey,
        systemPrompt,
        userMessage,
        schema: examSchema,
        maxTokens: MAX_TOKENS_EXAM,
      });
    } catch {
      throw new HttpsError("internal", "Failed to generate exam.");
    }

    // Validate 60/20/20 distribution; retry once if invalid
    const distributionError = validateExamDistribution(exam, req.totalPoints);
    if (distributionError) {
      logger.warn("Exam distribution invalid; retrying with corrective nudge", {
        distributionError,
      });
      const correctedMessage = `${userMessage}\n\nYour previous response had an invalid point distribution: ${distributionError}\n\nFix the distribution to match exactly 60% direct, 20% indirect, 20% synthesis and ensure sum(points) = ${req.totalPoints}. Return only the JSON object.`;
      try {
        exam = await generateWithClaude({
          apiKey,
          systemPrompt,
          userMessage: correctedMessage,
          schema: examSchema,
          maxTokens: MAX_TOKENS_EXAM,
        });
      } catch {
        throw new HttpsError("internal", "Failed to generate exam after retry.");
      }
    }

    const ref = await getFirestore()
      .collection("users")
      .doc(uid)
      .collection("exams")
      .add({
        createdAt: FieldValue.serverTimestamp(),
        subject: req.subject,
        topics: req.topics,
        totalPoints: req.totalPoints,
        country: req.country,
        gradeLevel: req.gradeLevel ?? null,
        language: req.language ?? null,
        bookIds: req.bookIds ?? [],
        exam,
      });

    return { id: ref.id, exam };
  },
);
