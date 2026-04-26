import Anthropic from "@anthropic-ai/sdk";
import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { defineSecret } from "firebase-functions/params";
import { onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/v2";

import { streamWithClaude } from "./claude";
import { getCurriculumProfile } from "./curriculum";
import { buildCoursePrompt, buildRagContextBlock } from "./prompts";
import { enforceRateLimit } from "./rateLimit";
import { searchRelevantChunks, fetchStyleChunks } from "./rag";
import { verifyFirebaseToken, startSSE, sendSSE, endSSE } from "./streamHelpers";
import { generateCourseRequestSchema, courseSchema, type Course } from "./schema";

if (getApps().length === 0) initializeApp();

const ANTHROPIC_API_KEY = defineSecret("ANTHROPIC_API_KEY");
const GCP_PROJECT_ID = defineSecret("GCP_PROJECT_ID");

export const generateCourseStream = onRequest(
  {
    region: "us-central1",
    secrets: [ANTHROPIC_API_KEY, GCP_PROJECT_ID],
    memory: "512MiB",
    timeoutSeconds: 300,
  },
  async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") { res.status(204).end(); return; }
    if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

    let uid: string;
    try {
      uid = await verifyFirebaseToken(req);
    } catch {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const parsed = generateCourseRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") });
      return;
    }
    const data = parsed.data;

    try {
      await enforceRateLimit(uid, "generateCourse", 10);
    } catch {
      res.status(429).json({ error: "Rate limit exceeded. Try again later." });
      return;
    }

    startSSE(res);

    try {
      const profile = await getCurriculumProfile(data.country);
      let ragContext = "";
      if (data.bookIds?.length) {
        const [contentChunks, styleChunks] = await Promise.all([
          searchRelevantChunks(data.topic, data.bookIds, GCP_PROJECT_ID.value(), 20),
          fetchStyleChunks(data.bookIds, GCP_PROJECT_ID.value()),
        ]);
        ragContext = buildRagContextBlock(contentChunks, styleChunks);
      }

      const systemPrompt = buildCoursePrompt({
        subject: data.subject,
        topic: data.topic,
        country: data.country,
        gradeLevel: data.gradeLevel,
        language: data.language,
        profile,
        ragContext,
      });

      const apiKey = ANTHROPIC_API_KEY.value().trim();
      if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured");

      const course: Course = await streamWithClaude({
        apiKey,
        systemPrompt,
        userMessage: `Generate a complete course lesson on "${data.topic}" for ${data.subject} at ${data.country}${data.gradeLevel ? ` ${data.gradeLevel}` : ""} level. Return only the JSON object.`,
        schema: courseSchema,
        onDelta: (text) => sendSSE(res, { type: "delta", text }),
      });

      const ref = await getFirestore()
        .collection("users")
        .doc(uid)
        .collection("courses")
        .add({
          createdAt: FieldValue.serverTimestamp(),
          subject: data.subject,
          topic: data.topic,
          country: data.country,
          gradeLevel: data.gradeLevel ?? null,
          language: data.language ?? null,
          bookIds: data.bookIds ?? [],
          course,
        });

      sendSSE(res, { type: "result", id: ref.id, course });
    } catch (err) {
      const message =
        err instanceof Anthropic.APIError
          ? `Anthropic API ${err.status}: ${err.message}`
          : err instanceof Error ? err.message : "Generation failed";
      logger.error("generateCourseStream failed", { uid, error: message });
      sendSSE(res, { type: "error", message });
    }

    endSSE(res);
  },
);
