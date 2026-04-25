import type { CurriculumProfile, RagChunk, Subject, WritingSubject } from "./schema";

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
    ragContext
      ? `If REFERENCE MATERIAL is provided above, use the EXACT notation, vocabulary, and reasoning style from those excerpts throughout your solution. The student's textbook is the ultimate authority on notation and method.`
      : "",
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

/**
 * Builds the RAG context block injected into every generation prompt.
 *
 * @param contentChunks - Topically relevant chunks (from vector search)
 * @param styleChunks   - Opening chunks of the book (for style/notation sampling)
 *
 * When style chunks are provided the block is split into two labeled sections
 * and a STYLE MANDATE is added so Claude knows it must mirror the book's
 * notation, vocabulary, and pedagogical approach — not just use it as a
 * factual reference.
 */
export function buildRagContextBlock(
  contentChunks: RagChunk[],
  styleChunks: RagChunk[] = [],
): string {
  if (contentChunks.length === 0 && styleChunks.length === 0) return "";

  const parts: string[] = ["REFERENCE MATERIAL (from uploaded textbooks):"];

  if (styleChunks.length > 0) {
    const styleEntries = styleChunks
      .map(
        (c, i) =>
          `[Style Sample ${i + 1}${c.bookTitle ? ` — ${c.bookTitle}` : ""}]\n${c.text}`,
      )
      .join("\n\n");
    parts.push(
      `── STYLE GUIDE (opening pages of the textbook)\n` +
      `   Study these to learn the book's notation, vocabulary, and pedagogical approach.\n\n` +
      styleEntries,
    );
  }

  if (contentChunks.length > 0) {
    const contentEntries = contentChunks
      .map(
        (c, i) =>
          `[Excerpt ${i + 1}${c.pageHint ? ` — p.${c.pageHint}` : ""}${c.bookTitle ? ` — ${c.bookTitle}` : ""}]\n${c.text}`,
      )
      .join("\n\n");
    parts.push(
      `── CONTENT REFERENCE (topically relevant — cite by excerpt number when relevant)\n\n` +
      contentEntries,
    );
  }

  if (styleChunks.length > 0) {
    parts.push(
      `── STYLE MANDATE — READ THIS BEFORE WRITING ANYTHING ──\n` +
      `\n` +
      `Study the STYLE GUIDE excerpts above. Before you write a single word of output,\n` +
      `mentally answer each question below about the book's style, then apply your answers\n` +
      `rigidly throughout every sentence you write.\n` +
      `\n` +
      `APPROACH & STRUCTURE\n` +
      `• Does the book open a topic with a concrete real-world story or motivating scenario\n` +
      `  BEFORE any formal definition? → If yes, your output MUST do the same. Start with\n` +
      `  a concrete, engaging scenario. Never open with a definition box.\n` +
      `• Does the book use §-numbered paragraphs (§1, §2, §3...) rather than Roman-numeral\n` +
      `  sections (I., II., I.1, I.2...)? → Mirror the exact heading/paragraph structure.\n` +
      `• Does the book write flowing prose rather than bullet-list theory? → Never use\n` +
      `  bullet lists or numbered lists inside explanations; write full prose paragraphs.\n` +
      `• Does the book pose questions to the reader ("Quel est le remède ?" "Pourquoi ?")\n` +
      `  and answer them inline? → Reproduce this Socratic dialogue style.\n` +
      `• Does the book include worked numerical examples inline (tables of values, explicit\n` +
      `  computations)? → Include the same kind of concrete illustrations.\n` +
      `\n` +
      `NOTATION & VOCABULARY\n` +
      `• Use the EXACT same symbols for every mathematical object (vectors, derivatives,\n` +
      `  integrals, limits, sets — whatever notation the book uses, even if unusual).\n` +
      `• Use the book's own words for every concept. Never substitute a synonym.\n` +
      `• Copy the book's punctuation conventions (e.g. ⩾ vs ≥, semicolons in sets, etc.).\n` +
      `\n` +
      `LEVEL & RIGOUR\n` +
      `• Match the assumed prior knowledge exactly — do not introduce or skip prerequisites\n` +
      `  that the book treats differently.\n` +
      `• Match the level of proof rigour: if the book gives informal geometric arguments\n` +
      `  alongside formal proofs, do the same; if it is purely formal, be purely formal.\n` +
      `\n` +
      `VOICE & TONE\n` +
      `• Match the authorial voice (formal? conversational? first-person plural "nous"?).\n` +
      `• If the book uses footnotes for technical asides, signal them with "(cf. note)" in\n` +
      `  the text (you cannot produce actual footnotes in plain text).\n` +
      `\n` +
      `HARD RULE: A reader familiar with the textbook must not be able to tell that the\n` +
      `generated content was not written by the book's own author. Any deviation from the\n` +
      `book's style is a failure, even if the mathematics is correct.`,
    );
  }

  return parts.join("\n\n");
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
    ragContext
      ? `PRIMARY RULE — MIMIC THE SOUL, NOT THE WORDS:\n` +
        `Your task is to generate a course on "${topic}" that has the SAME SOUL as the book.\n` +
        `"Same soul" means:\n` +
        `\n` +
        `WAY OF REASONING\n` +
        `• Study HOW the book builds understanding: does it start with a concrete physical\n` +
        `  scenario, then formalise? Does it pose a problem, show why naive solutions fail,\n` +
        `  then refine? Does it use geometric intuition before algebra? Apply that exact\n` +
        `  same intellectual journey to "${topic}".\n` +
        `• When the book proves something, study the TYPE of argument it uses (approximation\n` +
        `  + refinement? contradiction? explicit construction? graphical argument?). Use\n` +
        `  the same type of argument for analogous results in "${topic}".\n` +
        `• If the book motivates a concept with a real-world story, invent an equivalent\n` +
        `  motivating story for "${topic}" — same rhetorical structure, different scenario.\n` +
        `\n` +
        `WAY OF CHOOSING EXAMPLES\n` +
        `• Study the KIND of examples the book favours: concrete numerical sequences?\n` +
        `  geometric constructions? algorithmic computations? Pick examples of the same\n` +
        `  KIND for "${topic}", including any numerical tables or step-by-step computations\n` +
        `  the book's style calls for.\n` +
        `• If the book's excerpts contain specific examples directly about "${topic}", use\n` +
        `  those exact examples (same numbers, same steps) — they are the reference.\n` +
        `\n` +
        `WAY OF WRITING\n` +
        `• Follow the STYLE MANDATE above for every structural and notational decision.\n` +
        `• The reader should feel they are reading a chapter of the same book — not because\n` +
        `  the words are copied, but because the thinking feels identical.`
      : `Generate a complete course lesson on the topic: "${topic}". The theory section must be thorough and pedagogically sound for the ${country} curriculum.`,
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
    ragContext
      ? `PRIMARY RULE — MIMIC THE SOUL:\n` +
        `Generate ${count} ${difficulty}-difficulty exercises that have the SAME SOUL as the\n` +
        `book's own exercises. "Same soul" means:\n` +
        `• If the book's exercises contain problems directly on "${topic}", use those exact\n` +
        `  problems (same wording, same numbers) as your first priority.\n` +
        `• For any remaining exercises, construct NEW problems that follow the same PATTERN\n` +
        `  as the book's exercises: same type of question, same level of abstraction, same\n` +
        `  kind of reasoning required — not a copy, but a sibling.\n` +
        `• Solutions must be worked out using the SAME METHOD the book uses for similar\n` +
        `  problems — same argument type, same level of rigour, same intermediate steps.\n` +
        `• Follow the STYLE MANDATE for all notation, vocabulary, and solution structure.`
      : `Generate exactly ${count} ${difficulty}-difficulty practice exercise(s) on the topic: "${topic}". Difficulty: ${difficultyDesc}.`,
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
    ragContext
      ? `PRIMARY RULE — MIMIC THE SOUL:\n` +
        `Create an exam that tests the same REASONING SKILLS the book trains — not just\n` +
        `the facts it states. "Same soul" means:\n` +
        `• Direct questions should ask students to apply the same type of argument or\n` +
        `  computation the book uses in its simplest examples.\n` +
        `• Indirect questions should require combining concepts the way the book combines\n` +
        `  them in its worked problems.\n` +
        `• Synthesis questions should demand the same kind of creative or generalising\n` +
        `  thinking the book demonstrates in its hardest results.\n` +
        `• Every solution must be worked out using the SAME METHOD and level of rigour\n` +
        `  the book uses for similar problems.\n` +
        `• Use the book's exact notation and vocabulary throughout.\n` +
        `• Follow the STYLE MANDATE for all structure and voice decisions.`
      : `Create a complete ${subjectLabel} exam covering the following topic(s): ${topics.join(", ")}.`,
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

// ── Writing analysis prompt ───────────────────────────────────────────────────

const WRITING_SUBJECT_LABELS: Record<WritingSubject, string> = {
  grammar: "grammar and language mechanics",
  essay: "essay writing and argumentation",
  vocabulary: "vocabulary and word usage",
  literature: "literary analysis",
  reading: "reading comprehension",
};

const WRITING_SUBJECT_INSTRUCTIONS: Record<WritingSubject, string> = {
  grammar:
    "Identify and correct all grammar, spelling, punctuation, and sentence structure errors. For each correction, provide the original text, the corrected version, and a clear explanation of the rule that was violated.",
  essay:
    "Evaluate the essay's thesis, argument structure, evidence, coherence, and style. Identify specific passages that need improvement and explain how to strengthen them.",
  vocabulary:
    "Explain the meaning, usage, connotations, and register of the target words or phrases. Provide example sentences and highlight common errors in usage.",
  literature:
    "Analyze the literary devices, themes, characters, structure, and author's craft in the text. Support observations with textual evidence.",
  reading:
    "Answer the comprehension questions or summarize the key ideas of the passage. Explain the reasoning for each answer by referencing the text directly.",
};

const WRITING_ANALYSIS_JSON_CONTRACT = `Return ONLY a single JSON object (no markdown fences, no prose before or after) matching this TypeScript type:

type WritingAnalysis = {
  restatement: string;              // the task or question restated in your own words
  feedback: string;                 // main analysis, evaluation, or explanation (full prose)
  corrections: Array<{             // specific corrections or improvements; [] if not applicable
    original: string;              // the original text or phrase
    corrected: string;             // the corrected or improved version
    explanation: string;           // why this correction was made (rule, principle, etc.)
  }>;
  suggestions: string[];           // actionable improvement suggestions; [] if none
  conclusion: string;              // brief wrap-up summarising the main takeaways
};`;

export interface BuildWritingAnalysisPromptArgs {
  country: string;
  gradeLevel?: string;
  language?: string;
  writingSubject: WritingSubject;
  profile?: CurriculumProfile | null;
  ragContext?: string;
}

export function buildWritingAnalysisPrompt(
  args: BuildWritingAnalysisPromptArgs,
): string {
  const { country, gradeLevel, language, writingSubject, profile, ragContext } =
    args;

  const subjectLabel = WRITING_SUBJECT_LABELS[writingSubject];
  const language_ =
    language ?? profile?.defaultLanguage ?? "the student's language";
  const subjectInstruction = WRITING_SUBJECT_INSTRUCTIONS[writingSubject];

  const curriculumBlock = profile
    ? [
        `A curated curriculum profile is provided for ${profile.countryName ?? country}. Follow it strictly.`,
        profile.notation ? `Language conventions: ${profile.notation}` : null,
        profile.conventions ? `Conventions: ${profile.conventions}` : null,
        profile.referenceBooks?.length
          ? `Reference books (cite when relevant): ${profile.referenceBooks.join("; ")}`
          : null,
        profile.notes ? `Additional notes: ${profile.notes}` : null,
      ]
        .filter(Boolean)
        .join("\n")
    : `No curated profile is provided. Use your best knowledge of the ${country} language arts curriculum — the official standards, conventions, and pedagogical expectations — for a student${gradeLevel ? ` at ${gradeLevel} level` : ""}.`;

  return [
    `You are a patient, expert ${subjectLabel} tutor.`,
    `Audience: a student in ${country}${gradeLevel ? `, grade ${gradeLevel}` : ""}.`,
    `Answer language: ${language_}.`,
    ``,
    `Curriculum:`,
    curriculumBlock,
    ragContext ? `\n${ragContext}` : "",
    ``,
    subjectInstruction,
    ``,
    `Be constructive and encouraging. Explain WHY each correction or suggestion matters — name the rule, principle, or rhetorical strategy involved. Tailor vocabulary and depth to the student's level.`,
    ``,
    WRITING_ANALYSIS_JSON_CONTRACT,
  ]
    .filter((line) => line !== "")
    .join("\n");
}

export const WRITING_USER_INSTRUCTION_FOR_TEXT = (text: string): string =>
  `Here is the writing task:\n\n${text}\n\nAnalyze it according to the rules in the system prompt. Return only the JSON object.`;

export const WRITING_USER_INSTRUCTION_FOR_IMAGE =
  "The writing task is in the attached image. Read it carefully, then analyze it according to the rules in the system prompt. Return only the JSON object.";

export const WRITING_USER_INSTRUCTION_FOR_PDF =
  "The writing task is in the attached PDF. Read it carefully, then analyze it according to the rules in the system prompt. Return only the JSON object.";

// ── Writing content generation prompt ─────────────────────────────────────────

const WRITING_CONTENT_TYPE_LABELS: Record<string, string> = {
  lesson: "lesson",
  exercise: "exercise set",
  quiz: "quiz",
  essay_prompt: "essay prompt",
};

const WRITING_CONTENT_JSON_CONTRACT = `Return ONLY a single JSON object (no markdown fences, no prose) matching this TypeScript type:

type WritingContent = {
  title: string;
  contentType: "lesson" | "exercise" | "quiz" | "essay_prompt";
  writingSubject: "grammar" | "essay" | "vocabulary" | "literature" | "reading";
  // For lessons:
  theory?: string;                 // prose explanation of the concept
  keyConcepts?: Array<{ term: string; definition: string }>;
  // For exercises and quizzes:
  items?: Array<{
    prompt: string;                // the question or task
    hints?: string[];              // optional hints (1-3)
    answer: string;                // model answer
    explanation: string;           // why this is the correct answer
  }>;
  // For essay prompts:
  prompt?: string;                 // the essay question or scenario
  criteria?: string[];             // evaluation criteria
  tips?: string[];                 // writing tips for the student
  summary?: string;                // closing note or learning objective
};`;

export interface BuildWritingGenerationPromptArgs {
  writingSubject: WritingSubject;
  contentType: "lesson" | "exercise" | "quiz" | "essay_prompt";
  topic: string;
  country: string;
  gradeLevel?: string;
  language?: string;
  difficulty?: "easy" | "medium" | "hard";
  count?: number;
  profile?: CurriculumProfile | null;
  ragContext?: string;
}

export function buildWritingGenerationPrompt(
  args: BuildWritingGenerationPromptArgs,
): string {
  const {
    writingSubject,
    contentType,
    topic,
    country,
    gradeLevel,
    language,
    difficulty,
    count,
    profile,
    ragContext,
  } = args;

  const subjectLabel = WRITING_SUBJECT_LABELS[writingSubject];
  const contentTypeLabel = WRITING_CONTENT_TYPE_LABELS[contentType];
  const language_ =
    language ?? profile?.defaultLanguage ?? "the student's language";
  const audienceDesc = `${country}${gradeLevel ? ` grade ${gradeLevel}` : ""} students`;

  const curriculumNote = profile
    ? `Follow the ${profile.countryName ?? country} language arts curriculum strictly.`
    : `Follow the official ${country} language arts curriculum and use vocabulary, examples, and conventions that ${audienceDesc} would recognise.`;

  const contentTypeInstruction = {
    lesson: `Generate a complete lesson on "${topic}". Include a thorough theory section, at least 3 key concepts with definitions, and a summary.`,
    exercise: `Generate exactly ${count ?? 5} ${difficulty ?? "medium"}-difficulty exercises on "${topic}". Each must have a model answer and a clear explanation. Include 1–3 hints per exercise.`,
    quiz: `Generate exactly ${count ?? 5} ${difficulty ?? "medium"}-difficulty quiz questions on "${topic}". Each must have a model answer and a clear explanation.`,
    essay_prompt: `Generate a compelling essay prompt on "${topic}". Include clear evaluation criteria and practical writing tips for students.`,
  }[contentType];

  return [
    `You are an expert ${subjectLabel} educator preparing a ${contentTypeLabel}.`,
    `Audience: ${audienceDesc}.`,
    `Answer language: ${language_}.`,
    ``,
    curriculumNote,
    ragContext ? `\n${ragContext}` : "",
    ``,
    contentTypeInstruction,
    ``,
    WRITING_CONTENT_JSON_CONTRACT,
  ]
    .filter((line) => line !== "")
    .join("\n");
}
