import type { CurriculumProfile, RagChunk, Subject } from "./schema";

/**
 * JSON output contract that Claude MUST return. Kept in sync with
 * `solutionSchema` in schema.ts. We describe it as text so the model emits
 * strict JSON we can parse with zod.
 */
const JSON_CONTRACT = `Return ONLY a single JSON object (no markdown fences, no prose before or after) matching this TypeScript type:

type Solution = {
  restatement: string;              // the problem restated in your own words
  assumptions: string[];            // any assumptions you make; [] if none
  steps: Array<{
    title: string;                  // short label for this step
    expression: string;             // the math for this step, in LaTeX (no surrounding $)
    explanation: string;            // WHY this step follows from the previous one — the passage between step N-1 and step N
    ruleOrTheorem?: string;         // name of the rule/theorem/identity used, cite curriculum sources when applicable
  }>;                               // at least 1 element
  finalAnswer: string;              // the final answer, LaTeX
  verification?: string;            // optional sanity check (substitute back, check units, etc.)
};`;

const SUBJECT_LABELS: Record<Subject, string> = {
  math: "mathematics",
  physics: "physics",
  chemistry: "chemistry",
  informatics: "computer science / informatics",
};

export interface BuildSystemPromptArgs {
  country: string;
  gradeLevel?: string;
  language?: string;
  subject?: Subject;
  profile?: CurriculumProfile | null;
  ragContext?: string;
}

/**
 * Build the system prompt. When a curated curriculum profile exists in
 * Firestore we inject it; otherwise we tell Claude to rely on its knowledge
 * of the requested country's curriculum and best practices.
 */
export function buildSystemPrompt(args: BuildSystemPromptArgs): string {
  const { country, gradeLevel, language, subject, profile, ragContext } = args;

  const subjectLabel = subject ? SUBJECT_LABELS[subject] : "mathematics";
  const language_ =
    language ?? profile?.defaultLanguage ?? "the student's language";

  const curriculumBlock = profile
    ? [
        `A curated curriculum profile is provided for ${profile.countryName ?? country}. Follow it strictly.`,
        profile.notation ? `Notation conventions: ${profile.notation}` : null,
        profile.conventions ? `Conventions: ${profile.conventions}` : null,
        profile.stepStyle ? `Step style: ${profile.stepStyle}` : null,
        profile.referenceBooks?.length
          ? `Reference books (cite when relevant): ${profile.referenceBooks.join("; ")}`
          : null,
        profile.notes ? `Additional notes: ${profile.notes}` : null,
      ]
        .filter(Boolean)
        .join("\n")
    : `No curated profile is provided. Use your best knowledge of the ${country} ${subjectLabel} curriculum — the official notation, conventions, pedagogical order, and widely adopted textbooks — and follow it faithfully. Prefer methods and vocabulary that a student in ${country}${gradeLevel ? ` at ${gradeLevel} level` : ""} would recognise.`;

  return [
    `You are a patient, rigorous ${subjectLabel} tutor.`,
    `Audience: a student in ${country}${gradeLevel ? `, grade ${gradeLevel}` : ""}.`,
    `Answer language: ${language_}.`,
    ``,
    `Curriculum:`,
    curriculumBlock,
    ragContext ? `\n${ragContext}` : "",
    ``,
    `Your objective is to make the PATH TO THE ANSWER understandable, not just the answer itself. For every step, you MUST explain WHY the step follows from the previous one (the "passage between two steps") — name the rule, identity, theorem, or algebraic manipulation used. Never skip steps a student at this level would find non-obvious. Do not use any tool the curriculum does not expect at this level.`,
    ``,
    `If the input contains multiple problems, solve each as a separate entry in \`steps\` grouped with clear \`title\`s, or — if clearer — answer only the first problem and note that others were skipped.`,
    ``,
    `If the problem is ambiguous, list the assumptions you make in \`assumptions\`.`,
    ``,
    JSON_CONTRACT,
  ]
    .filter((line) => line !== "")
    .join("\n");
}

// ── RAG context block ─────────────────────────────────────────────────────────

export function buildRagContextBlock(chunks: RagChunk[]): string {
  if (chunks.length === 0) return "";
  const entries = chunks
    .map(
      (c, i) =>
        `[Excerpt ${i + 1}${c.pageHint ? ` — approx. page ${c.pageHint}` : ""}]\n${c.text}`,
    )
    .join("\n\n");
  return `REFERENCE MATERIAL (from uploaded textbooks — cite by excerpt number when relevant):\n\n${entries}`;
}

// ── Course generation prompt ──────────────────────────────────────────────────

const COURSE_JSON_CONTRACT = `Return ONLY a single JSON object (no markdown fences, no prose) matching:

type Course = {
  subject: "math" | "physics" | "chemistry" | "informatics";
  topic: string;
  theory: string;           // complete prose explanation with inline LaTeX (no surrounding $$ blocks)
  keyConcepts: Array<{ term: string; definition: string }>;  // at least 1
  workedExamples: Array<{ problem: string; solution: string }>;  // at least 1
  summary: string;
};`;

export interface BuildCoursePromptArgs {
  subject: Subject;
  topic: string;
  country: string;
  gradeLevel?: string;
  language?: string;
  profile?: CurriculumProfile | null;
  ragContext?: string;
}

export function buildCoursePrompt(args: BuildCoursePromptArgs): string {
  const { subject, topic, country, gradeLevel, language, profile, ragContext } =
    args;
  const subjectLabel = SUBJECT_LABELS[subject];
  const language_ =
    language ?? profile?.defaultLanguage ?? "the student's language";
  const audienceDesc = `${country}${gradeLevel ? ` grade ${gradeLevel}` : ""} students`;

  const curriculumNote = profile
    ? `Follow the ${profile.countryName ?? country} curriculum strictly. Notation: ${profile.notation ?? "standard"}. Conventions: ${profile.conventions ?? "standard"}.`
    : `Follow the official ${country} ${subjectLabel} curriculum — use the notation, vocabulary, and pedagogical order that ${audienceDesc} would recognise.`;

  return [
    `You are an expert ${subjectLabel} educator preparing a course lesson.`,
    `Audience: ${audienceDesc}.`,
    `Answer language: ${language_}.`,
    ``,
    curriculumNote,
    ragContext ? `\n${ragContext}` : "",
    ``,
    `Generate a complete course lesson on the topic: "${topic}".`,
    `The theory section must be thorough, pedagogically sound, and written in the same "soul of thinking" as the reference textbooks for this curriculum.`,
    `Include at least 2 key concepts and 2 worked examples with full solutions.`,
    ``,
    COURSE_JSON_CONTRACT,
  ]
    .filter((line) => line !== "")
    .join("\n");
}

// ── Exercise generation prompt ────────────────────────────────────────────────

const EXERCISES_JSON_CONTRACT = `Return ONLY a single JSON object matching:

type ExercisesResponse = {
  exercises: Array<{
    question: string;
    hints?: string[];
    solution: {
      restatement: string;
      assumptions: string[];
      steps: Array<{ title: string; expression: string; explanation: string; ruleOrTheorem?: string }>;
      finalAnswer: string;
      verification?: string;
    };
  }>;
};`;

export interface BuildExercisesPromptArgs {
  subject: Subject;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  count: number;
  country: string;
  gradeLevel?: string;
  language?: string;
  profile?: CurriculumProfile | null;
  ragContext?: string;
}

export function buildExercisesPrompt(args: BuildExercisesPromptArgs): string {
  const {
    subject,
    topic,
    difficulty,
    count,
    country,
    gradeLevel,
    language,
    profile,
    ragContext,
  } = args;
  const subjectLabel = SUBJECT_LABELS[subject];
  const language_ =
    language ?? profile?.defaultLanguage ?? "the student's language";

  const difficultyDesc = {
    easy: "straightforward, single-concept, suitable for first practice",
    medium:
      "requires combining 2–3 concepts or multi-step reasoning, suitable for regular homework",
    hard: "challenging, requires deep understanding or creative reasoning, suitable for exam preparation",
  }[difficulty];

  return [
    `You are an expert ${subjectLabel} educator.`,
    `Audience: ${country}${gradeLevel ? ` grade ${gradeLevel}` : ""} students.`,
    `Answer language: ${language_}.`,
    ragContext ? `\n${ragContext}` : "",
    ``,
    `Generate exactly ${count} ${difficulty}-difficulty practice exercise(s) on the topic: "${topic}".`,
    `Difficulty descriptor: ${difficultyDesc}.`,
    `Each exercise must have a complete, step-by-step solution following the "passage between steps" approach — explain WHY each step follows from the previous one.`,
    `Include 1–3 hints per exercise to guide students without revealing the answer.`,
    ``,
    EXERCISES_JSON_CONTRACT,
  ]
    .filter((line) => line !== "")
    .join("\n");
}

// ── Exam generation prompt ────────────────────────────────────────────────────

const EXAM_JSON_CONTRACT = `Return ONLY a single JSON object matching:

type Exam = {
  title: string;
  durationMinutes?: number;
  questions: Array<{
    type: "direct" | "indirect" | "synthesis";
    question: string;
    points: number;
    solution: {
      restatement: string;
      assumptions: string[];
      steps: Array<{ title: string; expression: string; explanation: string; ruleOrTheorem?: string }>;
      finalAnswer: string;
      verification?: string;
    };
    rubric?: string;
  }>;
  totalPoints: number;
};`;

export interface BuildExamPromptArgs {
  subject: Subject;
  topics: string[];
  totalPoints: number;
  country: string;
  gradeLevel?: string;
  language?: string;
  profile?: CurriculumProfile | null;
  ragContext?: string;
}

export function buildExamPrompt(args: BuildExamPromptArgs): string {
  const {
    subject,
    topics,
    totalPoints,
    country,
    gradeLevel,
    language,
    profile,
    ragContext,
  } = args;
  const subjectLabel = SUBJECT_LABELS[subject];
  const language_ =
    language ?? profile?.defaultLanguage ?? "the student's language";

  const directPts = Math.round(totalPoints * 0.6);
  const indirectPts = Math.round(totalPoints * 0.2);
  const synthPts = totalPoints - directPts - indirectPts;

  return [
    `You are an expert ${subjectLabel} educator creating an exam.`,
    `Audience: ${country}${gradeLevel ? ` grade ${gradeLevel}` : ""} students.`,
    `Answer language: ${language_}.`,
    ragContext ? `\n${ragContext}` : "",
    ``,
    `Create a complete ${subjectLabel} exam covering the following topic(s): ${topics.join(", ")}.`,
    ``,
    `MANDATORY point distribution (total = ${totalPoints} pts):`,
    `  - DIRECT questions: exactly ${directPts} pts total (60%). Single-step recall or direct application of a formula/definition. Lower points per question.`,
    `  - INDIRECT questions: exactly ${indirectPts} pts total (20%). Multi-step problems requiring combination of 2–3 concepts. Medium points per question.`,
    `  - SYNTHESIS questions: exactly ${synthPts} pts total (20%). Cross-topic, open-ended, proof or design; require deep understanding. Higher points per question.`,
    ``,
    `Constraints:`,
    `  - sum(questions.points) MUST equal ${totalPoints} exactly.`,
    `  - Each question MUST have type "direct", "indirect", or "synthesis".`,
    `  - Each question MUST include a full step-by-step solution.`,
    `  - Include an optional rubric string with grading guidance (partial credit criteria).`,
    `  - Set a realistic durationMinutes for this exam.`,
    ``,
    EXAM_JSON_CONTRACT,
  ]
    .filter((line) => line !== "")
    .join("\n");
}

export const USER_INSTRUCTION_FOR_IMAGE =
  "The math problem is in the attached image. Read it carefully (including any handwriting), restate it, then solve it step by step according to the rules in the system prompt. Return only the JSON object.";

export const USER_INSTRUCTION_FOR_PDF =
  "The math problem is in the attached PDF. Read it carefully, restate it, then solve it step by step according to the rules in the system prompt. Return only the JSON object.";

export const USER_INSTRUCTION_FOR_TEXT = (text: string): string =>
  `Here is the math problem:\n\n${text}\n\nRestate it, then solve it step by step according to the rules in the system prompt. Return only the JSON object.`;
