import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { defineSecret } from "firebase-functions/params";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/v2";

import { generateWithClaude } from "./claude";
import { getCurriculumProfile } from "./curriculum";
import { buildExamPrompt, buildRagContextBlock } from "./prompts";
import { enforceRateLimit } from "./rateLimit";
import { searchRelevantChunks, fetchEarlyChunks } from "./rag";
import {
  generateExamRequestSchema,
  examSchema,
  type GenerateExamRequest,
  type Exam,
} from "./schema";

if (getApps().length === 0) initializeApp();

const ANTHROPIC_API_KEY = defineSecret("ANTHROPIC_API_KEY");
const GCP_PROJECT_ID = defineSecret("GCP_PROJECT_ID");

/** Validates the 60/20/20 distribution. Returns an error string or null if valid. */
export function validateExamDistribution(
  exam: Exam,
  totalPoints: number,
): string | null {
  const sum = exam.questions.reduce((acc, q) => acc + q.points, 0);
  if (Math.abs(sum - totalPoints) > 1) {
    return `Point sum ${sum} does not equal ${totalPoints}.`;
  }

  const directPts = exam.questions
    .filter((q) => q.type === "direct")
    .reduce((acc, q) => acc + q.points, 0);
  const indirectPts = exam.questions
    .filter((q) => q.type === "indirect")
    .reduce((acc, q) => acc + q.points, 0);
  const synthPts = exam.questions
    .filter((q) => q.type === "synthesis")
    .reduce((acc, q) => acc + q.points, 0);

  const directRatio = directPts / totalPoints;
  const indirectRatio = indirectPts / totalPoints;
  const synthRatio = synthPts / totalPoints;

  if (Math.abs(directRatio - 0.6) > 0.05) {
    return `Direct ratio ${(directRatio * 100).toFixed(0)}% is not ~60% (got ${directPts}/${totalPoints} pts).`;
  }
  if (Math.abs(indirectRatio - 0.2) > 0.05) {
    return `Indirect ratio ${(indirectRatio * 100).toFixed(0)}% is not ~20% (got ${indirectPts}/${totalPoints} pts).`;
  }
  if (Math.abs(synthRatio - 0.2) > 0.05) {
    return `Synthesis ratio ${(synthRatio * 100).toFixed(0)}% is not ~20% (got ${synthPts}/${totalPoints} pts).`;
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

    const profile = await getCurriculumProfile(req.country);

    let ragContext = "";
    if (req.bookIds?.length) {
      const [contentChunks, styleChunks] = await Promise.all([
        searchRelevantChunks(req.topics.join(", "), req.bookIds, GCP_PROJECT_ID.value(), 20),
        fetchEarlyChunks(req.bookIds),
      ]);
      ragContext = buildRagContextBlock(contentChunks, styleChunks);
    }

    const systemPrompt = buildExamPrompt({
      subject: req.subject,
      topics: req.topics,
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
