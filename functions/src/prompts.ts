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
      ? `PRIMARY RULE — GENERATE FOLLOWING THE BOOK'S EXACT PEDAGOGICAL PATTERN:\n` +
        `Your task is to generate a course on "${topic}" that is INDISCERNIBLE from a\n` +
        `real chapter of the same textbook. A professor who knows the book must not be\n` +
        `able to tell the difference.\n` +
        `\n` +
        `BEFORE WRITING — ANALYSE THE BOOK (mandatory internal step):\n` +
        `Read all CONTENT REFERENCE and STYLE GUIDE excerpts. Identify:\n` +
        `  • How does the book introduce a new topic? (concrete scenario first? formal\n` +
        `    definition first? motivating problem first? historical note?)\n` +
        `  • What level of proof rigor does the book use? (formal ε-δ? informal geometric?\n` +
        `    both together?)\n` +
        `  • What type of examples does the book favour? (numerical tables? graphical\n` +
        `    constructions? algebraic chains? explicit computations?)\n` +
        `  • What prerequisites does the book assume the reader already knows?\n` +
        `Apply this EXACT pattern — not a similar one — to "${topic}".\n` +
        `\n` +
        `CONTENT MANDATE:\n` +
        `• If the excerpts contain definitions, theorems, or proofs on "${topic}", reproduce\n` +
        `  their EXACT wording and proof structure. Do not paraphrase.\n` +
        `• If the excerpts contain worked examples on "${topic}", use those exact examples\n` +
        `  (same numbers, same steps). If you need additional examples, generate ones that\n` +
        `  are indiscernible siblings of those in the book.\n` +
        `• Never simplify, skip prerequisites, or lower the mathematical bar relative to\n` +
        `  what the book establishes.\n` +
        `\n` +
        `METHOD MANDATE (proofs and solutions):\n` +
        `• Identify the proof techniques the book uses (induction, contradiction, direct\n` +
        `  computation, ε-δ, comparison, construction, ...).\n` +
        `• Use those EXACT techniques for analogous results on "${topic}".\n` +
        `• Never substitute a simpler technique that the book explicitly avoids.\n` +
        `\n` +
        `LEARNING LEVEL MANDATE:\n` +
        `• The level is defined 100% by the book — not by the difficulty label, not by a\n` +
        `  generic curriculum. If the book is a university analysis textbook, write at that\n` +
        `  level. If it is a high-school textbook, write at that level.\n` +
        `• A student who has studied ONLY this book must recognize every concept, notation,\n` +
        `  and technique you use as familiar from the book.\n` +
        `\n` +
        `HARD RULE: A reader familiar with the textbook must not be able to tell that\n` +
        `the generated content was not written by the book's own author.`
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
      ? `PRIMARY RULE — GENERATE AT THE BOOK'S EXACT COMPLEXITY LEVEL:\n` +
        `Your task is to generate ${count} exercises on "${topic}" that are INDISCERNIBLE\n` +
        `from the exercises in the uploaded textbook. The most common failure is generating\n` +
        `exercises that are TOO SIMPLE. This is strictly forbidden.\n` +
        `\n` +
        `BEFORE WRITING — ANALYSE THE BOOK'S EXERCISES (mandatory internal step):\n` +
        `Read every CONTENT REFERENCE excerpt. For each exercise you find, identify:\n` +
        `  • How many distinct reasoning steps does it require? (count them)\n` +
        `  • How many concepts must be combined in a single question?\n` +
        `  • What type of mathematical act does it demand? (prove, compute, classify,\n` +
        `    construct, deduce, give a counter-example, generalise, ...)\n` +
        `  • Which specific theorems or techniques are required to solve it?\n` +
        `  • Are sub-questions chained? (does b) depend on a)? does c) use the result of b)?)\n` +
        `Your generated exercises MUST match these same counts, acts, and techniques.\n` +
        `\n` +
        `COMPLEXITY MANDATE — NON-NEGOTIABLE:\n` +
        `  ✗ FORBIDDEN: single-step computations if the book's exercises require multi-step reasoning\n` +
        `  ✗ FORBIDDEN: direct formula application if the book requires deriving or proving first\n` +
        `  ✗ FORBIDDEN: simple numerical inputs if the book works with general parameters (n, a, f, ...)\n` +
        `  ✗ FORBIDDEN: isolated questions if the book chains sub-questions a) → b) → c)\n` +
        `  ✗ FORBIDDEN: exercises that a student could solve without having read the book\n` +
        `  ✓ REQUIRED: same number of sub-steps, same type of reasoning, same level of abstraction\n` +
        `  ✓ REQUIRED: if the book's exercises end with a hard generalisation, yours must too\n` +
        `\n` +
        `METHOD MANDATE (solutions):\n` +
        `• Identify which technique the book uses to solve each type of problem on "${topic}"\n` +
        `  (ε-δ, induction, comparison, algebraic manipulation, geometric argument, ...).\n` +
        `• Solve your exercises using that EXACT technique — same argument structure, same\n` +
        `  intermediate steps, same level of rigour.\n` +
        `• Never use a shortcut the book does not use. Never use a more advanced method either.\n` +
        `\n` +
        `EXERCISE GENERATION STRATEGY:\n` +
        `• FIRST priority: if the excerpts contain exercises on "${topic}", use them exactly\n` +
        `  (same wording, same numbers). They are already at the right level.\n` +
        `• SECOND priority: generate SIBLINGS — keep the exact question structure, change\n` +
        `  only the specific function, sequence, or numerical values.\n` +
        `• NEVER generate generic exercises ("compute the derivative of...", "find the limit\n` +
        `  of...") unless the book asks exactly that question type.\n` +
        `\n` +
        `LEARNING LEVEL MANDATE:\n` +
        `• The level is defined 100% by the book. "${difficulty}" means: pick the ${difficulty}\n` +
        `  exercises from within the book's own range — do not lower the floor.\n` +
        `• A student who has studied ONLY this book must recognize the exercises as typical\n` +
        `  of their curriculum — neither too easy nor alien.`
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

const EXAM_JSON_CONTRACT = `Return ONLY a single JSON object (no markdown fences, no prose) matching:

type Exam = {
  title: string;
  durationMinutes?: number;
  totalPoints: number;
  exercises: Array<{
    title: string;          // "Exercice 01", "Exercice 02", etc.
    totalPoints: number;    // total points for this exercise
    type: "direct" | "indirect" | "synthesis";
    context: string;        // the shared setup: all definitions, sequences, functions
                            // given for this exercise — written as in the book
    parts: Array<{
      number: string;       // "1", "2", "3", ...
      subparts: Array<{
        letter: string;     // "a", "b", "c", ...
        question: string;   // question text; may reference earlier results
                            // ("En déduire...", "En utilisant 1a)...")
        points: number;
        solution: {
          restatement: string;
          assumptions: string[];
          steps: Array<{
            title: string;
            expression: string;   // LaTeX, no surrounding $
            explanation: string;
            ruleOrTheorem?: string;
          }>;
          finalAnswer: string;
          verification?: string;
        };
        rubric?: string;
      }>;
    }>;
  }>;
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
      ? `PRIMARY RULE — GENERATE AN EXAM INDISCERNIBLE FROM THE BOOK'S OWN EXAMS:\n` +
        `The most common failure is generating exercises that are TOO SIMPLE. This is\n` +
        `strictly forbidden. Every exercise must match the book's complexity exactly.\n` +
        `\n` +
        `BEFORE WRITING — ANALYSE THE BOOK'S EXERCISES (mandatory internal step):\n` +
        `Read every CONTENT REFERENCE excerpt. For each exercise or problem you find:\n` +
        `  • Count its numbered parts and lettered sub-questions.\n` +
        `  • Identify the CHAIN: which sub-question depends on a previous result?\n` +
        `  • Identify the mathematical acts demanded (prove, deduce, compute, classify,\n` +
        `    construct, generalise, find a counter-example, ...).\n` +
        `  • Identify the specific theorems, techniques, or definitions required.\n` +
        `  • Note the exact wording of enchaining phrases ("En déduire...", "Montrer que...",\n` +
        `    "En utilisant la question précédente...", etc.).\n` +
        `Your generated exercises MUST replicate this exact structure.\n` +
        `\n` +
        `EXERCISE GENERATION STRATEGY:\n` +
        `• FIRST PRIORITY: if the CONTENT REFERENCE excerpts contain complete exercises\n` +
        `  (context + numbered parts + sub-questions), use them EXACTLY — same notation,\n` +
        `  same wording, same chain. They are already at the right complexity.\n` +
        `• SECOND PRIORITY: if the excerpts contain partial exercises or theory that\n` +
        `  implies exercises, construct exercises in the exact same style, at the same\n` +
        `  depth, with the same type of chain.\n` +
        `• The context (shared setup) must read like a real textbook preamble — same\n` +
        `  density of notation, same level of assumption, same mathematical objects.\n` +
        `\n` +
        `METHOD MANDATE (solutions):\n` +
        `• Identify which technique the book uses for each type of question on these topics.\n` +
        `• Solve EVERY sub-question using that EXACT technique — same argument, same\n` +
        `  intermediate steps, same level of formal rigour.\n` +
        `• Never use a shortcut or a more advanced method the book does not use.\n` +
        `\n` +
        `COMPLEXITY MANDATE — NON-NEGOTIABLE:\n` +
        `  ✗ FORBIDDEN: generic questions ("compute the limit of f(x)") with no specific setup\n` +
        `  ✗ FORBIDDEN: isolated sub-questions that do not chain into each other\n` +
        `  ✗ FORBIDDEN: synthesis exercises with fewer than 4 substantive sub-questions\n` +
        `  ✗ FORBIDDEN: direct exercises that require only one formula application\n` +
        `  ✓ REQUIRED: every synthesis exercise ends with a hard generalisation or open question\n` +
        `  ✓ REQUIRED: indirect exercises chain at least 3 results from 2 different concepts\n` +
        `\n` +
        `LEARNING LEVEL MANDATE:\n` +
        `• The level is defined 100% by the book. A student who has studied ONLY this book\n` +
        `  must be able to attempt every question — using only what the book teaches.\n` +
        `• Do not introduce any tool, theorem, or notation absent from the book.\n` +
        `\n` +
        `STEP — CLASSIFY AND DISTRIBUTE:\n` +
        `• Assign type based on actual complexity: single-concept chain = direct,\n` +
        `  multi-concept chain = indirect, deep 4+ part investigation = synthesis.\n` +
        `• Scale points to meet the 60/20/20 distribution.`
      : `Create a complete ${subjectLabel} exam covering the following topic(s): ${topics.join(", ")}.`,
    ``,
    `MANDATORY point distribution across exercises (total = ${totalPoints} pts):`,
    `  - DIRECT exercises: exactly ${directPts} pts total (60%). Each exercise tests direct`,
    `    recall/application. Typically 2–4 parts with straightforward subparts.`,
    `  - INDIRECT exercises: exactly ${indirectPts} pts total (20%). Each exercise requires`,
    `    combining 2–3 ideas, often with "En déduire..." chains.`,
    `  - SYNTHESIS exercises: exactly ${synthPts} pts total (20%). Each exercise is a deep`,
    `    investigation of ONE object (sequence, function, algorithm), with 4–6 numbered`,
    `    parts that build on each other, culminating in a hard generalisation.`,
    ``,
    `Constraints:`,
    `  - sum(exercises[i].totalPoints) MUST equal ${totalPoints} exactly.`,
    `  - Each exercise MUST have type "direct", "indirect", or "synthesis".`,
    `  - Each exercise MUST have at least 2 numbered parts.`,
    `  - Each part MUST have at least 1 lettered subpart.`,
    `  - CHAIN the subparts: later subparts must explicitly use results from earlier ones.`,
    `    Signal this with phrases like "En déduire...", "En utilisant 1a)...", "Montrer`,
    `    ensuite que..." — exactly as in the book's style.`,
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
