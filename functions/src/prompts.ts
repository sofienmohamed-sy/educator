import type { CurriculumProfile, RagChunk, Subject, WritingSubject } from "./schema";

/**
 * JSON output contract that Claude MUST return. Kept in sync with
 * `solutionSchema` in schema.ts. We describe it as text so the model emits
 * strict JSON we can parse with zod.
 */
const JSON_CONTRACT = `Return ONLY a single JSON object (no markdown fences, no prose before or after) matching this TypeScript type:

type GraphFunction = { expression: string; label?: string; color?: string };
type GraphSpec = { functions: GraphFunction[]; xMin: number; xMax: number; caption?: string };

type Solution = {
  restatement: string;              // the problem restated in your own words
  assumptions: string[];            // any assumptions you make; [] if none
  steps: Array<{
    title: string;                  // leave empty "" — do not number or label steps
    expression: string;             // ONLY the LaTeX expression — no surrounding words or sentences.
                                    // Must be valid LaTeX (parseable by KaTeX). Examples:
                                    //   "f(x) = x^2 - 2x + 3"
                                    //   "\\begin{cases} x^2 & x \\geq 0 \\\\ -x & x < 0 \\end{cases}"
                                    //   "\\lim_{x \\to 1^-} f(x) = 2"
                                    // NEVER write prose here ("finie sur R par :", "On calcule…").
                                    // If the step has no single expression, use "" (empty string).
    explanation: string;            // a single flowing sentence of mathematical reasoning —
                                    // write as a natural continuation, not a declaration
                                    // ("On a donc...", "Il s'ensuit que...", "D'où...")
    ruleOrTheorem?: string;         // ONLY include when citing a NAMED theorem that a student must
                                    // know by name (TVI, Rolle, Bolzano, d'Alembert, Abel, ...).
                                    // NEVER include for: standard derivatives, algebra, arithmetic,
                                    // or any operation that does not require invoking a theorem.
  }>;                               // at least 1 element
  finalAnswer: string;              // the final result as LaTeX if it is a formula or number
                                    // (e.g. "x = \\frac{3}{2}", "\\emptyset", "\\mathbb{R}").
                                    // If the answer is a prose conclusion write it as plain text
                                    // (e.g. "Il n'existe aucune valeur de a rendant f continue en 1.").
                                    // Do NOT force prose through \\text{} — just write it directly.
  verification?: string;            // optional sanity check (substitute back, check units, etc.)
  graphs?: GraphSpec[];             // include when the solution involves a curve / function graph.
                                    // expression: JS-evaluable string, e.g. "x**2 - 3*x + 2",
                                    //   "Math.sin(x)", "Math.log(x)", "Math.exp(x)".
                                    // Use ** for powers, Math.sqrt, Math.abs, Math.log, Math.exp.
                                    // Set xMin/xMax to a range that shows the relevant behaviour.
                                    // label: LaTeX label shown on the curve, e.g. "f", "g", "h".
                                    // caption: optional description shown below the graph.
};`;

const SUBJECT_LABELS: Record<Subject, string> = {
  math: "mathematics",
  physics: "physics",
  chemistry: "chemistry",
  informatics: "computer science / informatics",
};

/**
 * Render the curriculum profile as a prompt-injection block.
 * Used by every prompt builder so curriculum rules reach Claude consistently.
 *
 * `section` (filière / track / Spécialité / Leistungskurs / PCM-PCB / etc.)
 * narrows the audience within a level — e.g., FR Terminale "Spécialité Maths"
 * vs "NSI", MA 2ème Bac "Sciences Mathématiques A" vs "Physique-Chimie".
 */
function renderCurriculumBlock(
  profile: CurriculumProfile | null | undefined,
  country: string,
  subjectLabel: string,
  gradeLevel?: string,
  section?: string,
): string {
  const sectionLine = section
    ? `Section / track: ${section} — adapt the topic depth, expected prior knowledge, and exam style to this filière exactly. A student in another track at the same level would receive a different treatment.`
    : null;

  if (!profile) {
    return [
      `No curated profile is provided. Use your best knowledge of the ${country} ${subjectLabel} curriculum — the official notation, conventions, pedagogical order, and widely adopted textbooks — and follow it faithfully. Prefer methods and vocabulary that a student in ${country}${gradeLevel ? ` at ${gradeLevel} level` : ""}${section ? ` (${section})` : ""} would recognise.`,
      sectionLine,
    ]
      .filter(Boolean)
      .join("\n");
  }
  return [
    `A curated curriculum profile is provided for ${profile.countryName ?? country}${profile.subject ? ` (${profile.subject})` : ""}. Follow it strictly.`,
    sectionLine,
    profile.notation ? `Notation conventions: ${profile.notation}` : null,
    profile.conventions ? `Conventions: ${profile.conventions}` : null,
    profile.stepStyle ? `Step style: ${profile.stepStyle}` : null,
    profile.examFormat ? `Exam format: ${profile.examFormat}` : null,
    profile.exerciseStyle ? `Exercise style: ${profile.exerciseStyle}` : null,
    profile.referenceBooks?.length
      ? `Reference books (cite when relevant): ${profile.referenceBooks.join("; ")}`
      : null,
    profile.notes ? `Additional notes: ${profile.notes}` : null,
    profile.specialRules?.length
      ? `NON-NEGOTIABLE RULES for this curriculum:\n${profile.specialRules.map((r) => `  • ${r}`).join("\n")}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export interface BuildSystemPromptArgs {
  country: string;
  gradeLevel?: string;
  section?: string;
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
  const { country, gradeLevel, section, language, subject, profile, ragContext } = args;

  const subjectLabel = subject ? SUBJECT_LABELS[subject] : "mathematics";
  const language_ =
    language ?? profile?.defaultLanguage ?? "the student's language";

  const curriculumBlock = renderCurriculumBlock(
    profile,
    country,
    subjectLabel,
    gradeLevel,
    section,
  );

  return [
    `You are a patient, rigorous ${subjectLabel} tutor.`,
    `Audience: a student in ${country}${gradeLevel ? `, grade ${gradeLevel}` : ""}${section ? ` (${section})` : ""}.`,
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
  topic: string;            // chapter label only (no scope description)
  theory: string;           // complete prose explanation; inline LaTeX uses $...$ or \\(...\\);
                            // display math uses \\[...\\] on a SINGLE LINE (never split across lines)
  keyConcepts: Array<{ term: string; definition: string }>;  // at least 2
  workedExamples: Array<{ problem: string; solution: string }>;  // at least 2
  summary: string;
};`;

export interface BuildCoursePromptArgs {
  subject: Subject;
  topic: string;
  country: string;
  gradeLevel?: string;
  section?: string;
  language?: string;
  profile?: CurriculumProfile | null;
  ragContext?: string;
}

export function buildCoursePrompt(args: BuildCoursePromptArgs): string {
  const { subject, topic, country, gradeLevel, section, language, profile, ragContext } =
    args;

  // topic = "Label — scope limits" (built by topicValue() in topics.ts).
  // Parse them so we can give Claude an explicit scope constraint block.
  const dashIdx = topic.indexOf(" — ");
  const topicLabel = dashIdx >= 0 ? topic.slice(0, dashIdx) : topic;
  const topicLimits = dashIdx >= 0 ? topic.slice(dashIdx + 3) : null;

  const subjectLabel = SUBJECT_LABELS[subject];
  const language_ =
    language ?? profile?.defaultLanguage ?? "the student's language";
  const audienceDesc = `${country}${gradeLevel ? ` grade ${gradeLevel}` : ""}${section ? ` (${section})` : ""} students`;

  const curriculumBlock = renderCurriculumBlock(
    profile,
    country,
    subjectLabel,
    gradeLevel,
    section,
  );

  // ── Scope constraints (always present for TN topics, often for others) ──
  const scopeBlock = topicLimits
    ? `STRICT SCOPE — official curriculum fiche for "${topicLabel}":\n` +
      `${topicLimits}\n` +
      `\n` +
      `SCOPE RULES (non-negotiable):\n` +
      `• Every concept, theorem, property, and example in your output MUST appear in the scope text above.\n` +
      `• Any item after "PAS" is EXPLICITLY FORBIDDEN — do not mention it even as a remark or footnote.\n` +
      `• Do not add generalisations, extensions, historical notes, or neighbouring topics absent from the scope.\n` +
      `• Do not include a recap table that duplicates content already present in theory or summary.`
    : null;

  // ── Pedagogical approach ─────────────────────────────────────────────────
  // Tunisia: exact format of a fiche pédagogique DRE Gabès.
  // Goal: output indiscernible from an original fiche if shuffled together.
  const pedagogyBlock =
    country === "TN"
      ? `FORMAT OBLIGATOIRE — Fiche pédagogique DRE Gabès (1ère / 2ème AS) :\n` +
        `\n` +
        `Le résultat DOIT être indiscernable d'une vraie fiche DRE Gabès : même structure,\n` +
        `même style, même niveau de langue. Si on mélange l'output généré avec la vraie fiche,\n` +
        `personne ne doit pouvoir distinguer lequel est l'original.\n` +
        `\n` +
        `STRUCTURE DE CHAQUE SECTION (à respecter à la lettre) :\n` +
        `\n` +
        `  **Activité**\n` +
        `  Situation de découverte NUMÉRIQUE qui amène l'élève à deviner le théorème.\n` +
        `  • Donner un contexte géométrique précis avec des valeurs numériques explicites\n` +
        `    (longueurs en cm, rapports donnés, noms de points clairs).\n` +
        `  • Puisque l'app n'affiche PAS de figures : écrire toutes les données dans le texte,\n` +
        `    ex: "Dans le triangle ABC, on donne AM = 2,5 cm, AB = 5 cm, AC = 8 cm,\n` +
        `    (MN)//(BC). Calculer AN."\n` +
        `  • Terminer par UNE question précise et courte ("Calculer AN.", etc.).\n` +
        `\n` +
        `  **Retenons** (ou **Théorème**)\n` +
        `  Énoncé formel du théorème, en gras, dans la langue exacte du programme tunisien.\n` +
        `  • Pas de preuve sauf si le scope l'exige explicitement.\n` +
        `  • Pas de remarques, pas d'extensions, pas de "cas particulier" non demandé.\n` +
        `\n` +
        `  **Application**\n` +
        `  Un seul problème numérique concret (valeurs différentes de l'Activité).\n` +
        `  • Ce problème DOIT figurer dans workedExamples avec sa résolution complète.\n` +
        `  • Pour les constructions (section IV si applicable) : énoncer le problème\n` +
        `    ("Construire M de [AB] tel que AM/AB = 3/5") SANS décrire les étapes de tracé.\n` +
        `\n` +
        `RÈGLES GÉNÉRALES :\n` +
        `  • Sections numérotées en romain et nommées (I- Droites des Milieux, II- Théorème\n` +
        `    de Thalès, etc.) exactement comme dans la fiche d'origine.\n` +
        `  • workedExamples = les résolutions complètes des Applications (une par section).\n` +
        `  • keyConcepts = les énoncés des Théorèmes/Retenons, un par section, mot pour mot.\n` +
        `  • Aucun concept nommé absent du scope (interdire "rapport de Thalès", "k∈]0;1[",\n` +
        `    et toute notion après "PAS" dans le scope).`
      : null;

  // ── Geometry construction rule (universal) ───────────────────────────────
  const noImagesRule =
    `NO-IMAGES RULE: this app displays no figures.\n` +
    `  • Replace figure data textually: give every numerical value (lengths, ratios, point names)\n` +
    `    directly in the problem statement so the student has all needed information.\n` +
    `  • Do NOT describe drawing steps (ruler, compass, "tracer la droite…").\n` +
    `  • For construction problems: state the goal only ("Construire M de [AB] tel que AM/AB = 3/5").`;

  // ── Main generation instruction ──────────────────────────────────────────
  const generationInstruction = ragContext
    ? `PRIMARY RULE — GENERATE FOLLOWING THE BOOK'S EXACT PEDAGOGICAL PATTERN:\n` +
      `Your task is to generate a course on "${topicLabel}" that is INDISCERNIBLE from a\n` +
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
      `Apply this EXACT pattern — not a similar one — to "${topicLabel}".\n` +
      `\n` +
      `CONTENT MANDATE:\n` +
      `• If the excerpts contain definitions, theorems, or proofs on "${topicLabel}", reproduce\n` +
      `  their EXACT wording and proof structure. Do not paraphrase.\n` +
      `• If the excerpts contain worked examples on "${topicLabel}", use those exact examples\n` +
      `  (same numbers, same steps). If you need additional examples, generate ones that\n` +
      `  are indiscernible siblings of those in the book.\n` +
      `• Never simplify, skip prerequisites, or lower the mathematical bar relative to\n` +
      `  what the book establishes.\n` +
      `\n` +
      `METHOD MANDATE (proofs and solutions):\n` +
      `• Identify the proof techniques the book uses (induction, contradiction, direct\n` +
      `  computation, ε-δ, comparison, construction, ...).\n` +
      `• Use those EXACT techniques for analogous results on "${topicLabel}".\n` +
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
    : `Generate a course lesson on "${topicLabel}" following EXACTLY the structure and style mandated above.\n` +
      `The output must be indiscernible from an original DRE Gabès fiche pédagogique when presented side by side.`;

  return [
    `You are an expert ${subjectLabel} educator preparing a course lesson.`,
    `Audience: ${audienceDesc}.`,
    `Answer language: ${language_}.`,
    ``,
    `Curriculum:`,
    curriculumBlock,
    ragContext ? `\n${ragContext}` : "",
    ``,
    scopeBlock,
    ``,
    pedagogyBlock,
    ``,
    noImagesRule,
    ``,
    generationInstruction,
    ``,
    COURSE_JSON_CONTRACT,
  ]
    .filter((line) => line !== null && line !== "")
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
  section?: string;
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
    section,
    language,
    profile,
    ragContext,
  } = args;
  const subjectLabel = SUBJECT_LABELS[subject];
  const language_ =
    language ?? profile?.defaultLanguage ?? "the student's language";

  const difficultyHelperDesc = {
    easy:
      "helpers are EXPLICIT — each sub-question directly states what to do and its link to the objective is obvious from question 1. The student can see the full path at a glance.",
    medium:
      "helpers are SEMI-HIDDEN — 1 to 2 sub-questions require a non-trivial connection that the student must discover. The objective becomes clear only mid-way through the exercise.",
    hard:
      "helpers are SUBTLE — the link between sub-questions and the final objective is hidden. The student must discover the path themselves. The difficulty is in the non-obviousness of the chain, NOT in formula complexity.",
  }[difficulty];

  const curriculumBlock = renderCurriculumBlock(
    profile,
    country,
    subjectLabel,
    gradeLevel,
    section,
  );

  return [
    `You are an expert ${subjectLabel} educator.`,
    `Audience: ${country}${gradeLevel ? ` grade ${gradeLevel}` : ""}${section ? ` (${section})` : ""} students.`,
    `Answer language: ${language_}.`,
    ``,
    `Curriculum:`,
    curriculumBlock,
    ragContext ? `\n${ragContext}` : "",
    ``,
    ragContext
      ? `EXERCISE DESIGN MODEL — UNDERSTAND THIS BEFORE WRITING ANYTHING:\n` +
        `\n` +
        `Every exercise has:\n` +
        `  1. ONE OBJECTIVE: a specific mathematical result to prove, compute, or construct.\n` +
        `     This is the destination — the final synthesis question.\n` +
        `  2. HELPER QUESTIONS: instead of writing "Hint: first show X", you pose a question\n` +
        `     "Show that X." That IS the helper. The student answers it and uses the result\n` +
        `     in the next question. Helpers can be type "direct" (method stated) or\n` +
        `     "indirect" (method unstated). NEVER type "synthesis".\n` +
        `  3. DIFFICULTY = HOW HIDDEN THE HELPERS ARE:\n` +
        `     • easy   → direct helpers only; path is visible from sub-question 1\n` +
        `     • medium → mix of direct and indirect helpers; 1–2 non-trivial connections\n` +
        `     • hard   → mostly indirect helpers; student must discover the path;\n` +
        `                synthesis objective only revealed at the last sub-question\n` +
        `\n` +
        `TARGET DIFFICULTY — "${difficulty.toUpperCase()}":\n` +
        `${difficultyHelperDesc}\n` +
        `Generate ${count} exercises following this exact helper-visibility level.\n` +
        `\n` +
        `BOOK ALIGNMENT:\n` +
        `• Scan every CONTENT REFERENCE excerpt for exercises on "${topic}". If found,\n` +
        `  use them EXACTLY (same wording, same numbers, same helper chain).\n` +
        `• If not enough found in excerpts, generate SIBLINGS: same chain structure,\n` +
        `  same helper type, same mathematical objects — only specific values change.\n` +
        `• The book's exercises set the target level. Never fall below that level.\n` +
        `• Never generate a generic isolated question ("compute the limit of f(x) as x→a")\n` +
        `  unless the book itself uses exactly that question format.\n` +
        `\n` +
        `METHOD MANDATE (solutions):\n` +
        `• Identify which technique the book uses for this type of problem (ε-δ, induction,\n` +
        `  comparison, algebraic manipulation, geometric argument, ...).\n` +
        `• Solve using that EXACT technique — same argument, same intermediate steps,\n` +
        `  same level of formal rigour. Never use a simpler shortcut.\n` +
        `\n` +
        `LEARNING LEVEL MANDATE:\n` +
        `• Level defined 100% by the book. "${difficulty}" selects exercises at the\n` +
        `  ${difficulty} end of the book's own range — do not lower the mathematical floor.\n` +
        `• A student who has studied ONLY this book must recognise every technique used.`
      : `Generate exactly ${count} ${difficulty}-difficulty practice exercise(s) on the topic: "${topic}".\n` +
        `Difficulty "${difficulty}" means: ${difficultyHelperDesc}`,
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
  exercises: Array<{            // EXACTLY 4 exercises
    title: string;              // "Exercice 01", "Exercice 02", etc.
    totalPoints: number;        // total points for this exercise (multiple of 0.25)
    context: string;            // the shared setup: all definitions, sequences, functions
                                // given for this exercise — written as in the book
    graphs?: Array<{            // include when exercise involves a function to visualise
      functions: Array<{
        expression: string;     // JS-evaluable: "x**2 - 3*x + 2", "Math.sin(x)", etc.
        label?: string;         // "f", "g", "C_f"
        color?: string;
      }>;
      xMin: number;
      xMax: number;
      caption?: string;
    }>;
    parts: Array<{
      number: string;       // "1", "2", "3", ...
      subparts: Array<{
        letter: string;     // "a", "b", "c", ...
        type: "direct" | "indirect" | "synthesis";
                            // direct   = explicit helper (path is obvious)
                            // indirect = semi-hidden helper (non-trivial connection needed)
                            // synthesis= the final objective question (NOT a helper)
                            //   RULE: helpers may only be "direct" or "indirect".
                            //   "synthesis" is ONLY for the final sub-question(s).
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
  section?: string;
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
    section,
    language,
    profile,
    ragContext,
  } = args;
  const subjectLabel = SUBJECT_LABELS[subject];
  const language_ =
    language ?? profile?.defaultLanguage ?? "the student's language";

  const curriculumBlock = renderCurriculumBlock(
    profile,
    country,
    subjectLabel,
    gradeLevel,
    section,
  );

  return [
    `You are an expert ${subjectLabel} educator creating an exam.`,
    `Audience: ${country}${gradeLevel ? ` grade ${gradeLevel}` : ""}${section ? ` (${section})` : ""} students.`,
    `Answer language: ${language_}.`,
    ``,
    `Curriculum:`,
    curriculumBlock,
    ragContext ? `\n${ragContext}` : "",
    ``,
    ragContext
      ? `EXERCISE DESIGN MODEL — UNDERSTAND THIS BEFORE WRITING ANYTHING:\n` +
        `\n` +
        `Every exercise has:\n` +
        `  1. ONE OBJECTIVE: a specific mathematical result to prove, compute, or construct.\n` +
        `     The student only discovers the full scope of the objective at the last sub-question.\n` +
        `  2. HELPER QUESTIONS: instead of writing "Hint: first show X", you pose a question\n` +
        `     "Show that X." — that IS the helper. The student answers it and the result\n` +
        `     becomes available for the next question. Helpers are of type "direct" or\n` +
        `     "indirect". They are NEVER of type "synthesis".\n` +
        `  3. THE SYNTHESIS QUESTION: the final sub-question — the objective the helpers\n` +
        `     were building toward. Requires combining all previous results.\n` +
        `\n` +
        `  QUESTION TYPES:\n` +
        `     • direct    → the question wording explicitly states the method to use\n` +
        `     • indirect  → the question names the target, but NOT the method\n` +
        `     • synthesis → the final objective; method and path are both hidden\n` +
        `\n` +
        `BOOK ANALYSIS — MANDATORY BEFORE WRITING:\n` +
        `Scan every CONTENT REFERENCE excerpt. For each exercise found:\n` +
        `  • Identify its objective (what mathematical result does it lead to?)\n` +
        `  • Map the helper questions: which one enables the next? what type is each?\n` +
        `  • Classify each sub-question as direct, indirect, or synthesis.\n` +
        `  • Note the exact enchaining phrases ("En déduire...", "Montrer que...",\n` +
        `    "En utilisant 1a)...", "En déduire ensuite que...", etc.).\n` +
        `\n` +
        `EXERCISE GENERATION:\n` +
        `• FIRST: if the excerpts contain complete exercises, use them EXACTLY — same\n` +
        `  context, same notation, same helper chain, same wording.\n` +
        `• SECOND: generate exercises in the SAME STYLE — same type of objective,\n` +
        `  same helper-chain depth, same mathematical objects.\n` +
        `• Context must read like a real textbook preamble: same density of notation,\n` +
        `  same level of assumptions, same mathematical objects as the book.\n` +
        `\n` +
        `METHOD MANDATE (solutions):\n` +
        `• Identify which technique the book uses for each type of question.\n` +
        `• Solve every sub-question with that EXACT technique — same argument structure,\n` +
        `  same intermediate steps, same formal rigour. Never use a simpler shortcut.\n` +
        `\n` +
        `LEARNING LEVEL MANDATE:\n` +
        `• Level defined 100% by the book. A student who has studied ONLY this book\n` +
        `  must be able to attempt every question — using only what the book teaches.\n` +
        `• Do not introduce any tool, theorem, or notation absent from the book.`
      : `Create a complete ${subjectLabel} exam covering the following topic(s): ${topics.join(", ")}.`,
    ``,
    `SUBPART TYPE DEFINITIONS (60/20/20 within EACH exercise):`,
    ``,
    `  WHAT IS A HELPER?`,
    `  A helper is a question posed to the student — not a written hint or indication.`,
    `  Instead of saying "Hint: first show that u_n is bounded", you ask:`,
    `  "Show that (u_n) is bounded above." That question IS the helper.`,
    `  Helpers exist to make the final synthesis question reachable step by step.`,
    `  Helper questions are of type "direct" or "indirect" — NEVER "synthesis".`,
    ``,
    `  "direct"    (60% of subpart points per exercise):`,
    `      A helper question where the method is explicit in the wording,`,
    `      OR a question whose result follows immediately from the PREVIOUS sub-question`,
    `      (the previous question handed the student the exact tool or result needed).`,
    `      Example: "Using the definition of the limit, show that u_n → L."`,
    `               "Apply the mean value theorem to f on [a, b]."`,
    `               "Determine the inflection points of C_g." (when the previous`,
    `                sub-question asked to compute g''(x) in factored form — the student`,
    `                only needs to solve g''(x) = 0 using what was just derived)`,
    ``,
    `  CONTEXT RULE FOR "direct":`,
    `      If sub-question (n-1) produced the exact intermediate result that (n) needs,`,
    `      then (n) is "direct" — the path is obvious because the result was handed over.`,
    `      "indirect" means the student must discover WHICH prior result to use or HOW`,
    `      to connect it — not just apply it mechanically.`,
    ``,
    `  "indirect"  (20% of subpart points per exercise):`,
    `      A helper question where the method is NOT stated — only the target —`,
    `      AND the connection to previous results is non-trivial (not mechanical).`,
    `      The student must choose the method and/or the relevant prior result themselves.`,
    `      Example: "Show that (u_n) is monotone and bounded."`,
    `               "Determine the sign of f'(x) on ℝ." (without having just computed f')`,
    ``,
    `  "synthesis" (20% of subpart points per exercise):`,
    `      THE FINAL OBJECTIVE of the exercise — NOT a helper.`,
    `      This is the question that the helpers have been building toward.`,
    `      It requires combining ALL previous results. Without having answered`,
    `      the helpers, the student cannot answer this.`,
    `      ALWAYS placed LAST in the exercise.`,
    `      Example: "Deduce that (u_n) converges and find its limit."`,
    `               "Conclude about the global behaviour of f."`,
    ``,
    `  ORDER RULE: direct helpers → indirect helpers → synthesis`,
    `  The synthesis question NEVER appears before a direct or indirect question.`,
    ``,
    `QUESTION WORDING RULE — NON-NEGOTIABLE:`,
    `  Each sub-question must state ONLY the mathematical target (what to prove, compute, or determine).`,
    `  NEVER write in the question: "en utilisant X", "en appliquant Y", "à l'aide de 1a)",`,
    `  "en vous aidant de...", "en déduire de la question précédente...", or any other explicit`,
    `  method reference. The chaining is STRUCTURAL (it comes after the previous question) —`,
    `  it must NOT be stated in the wording. The student deduces the connection themselves.`,
    `  ✗ BAD:  "En utilisant la factorisation de 2b), étudier le signe de f(x)."`,
    `  ✓ GOOD: "Étudier le signe de f(x) sur ℝ."`,
    ``,
    `POINTS PER SUB-QUESTION — NON-NEGOTIABLE:`,
    `  Every point value MUST be a multiple of 0.25.`,
    `  Allowed values (scale with the exam total): 0.25 · 0.50 · 0.75 · 1.00 · 1.25 · 1.50 · 2.00`,
    `  The sum of all subpart points in each exercise MUST equal that exercise's totalPoints exactly.`,
    ``,
    `GRAPH RULE:`,
    `  When an exercise involves a function study (courbe représentative, tableau de variations,`,
    `  graphical reading), include a "graphs" field on the exercise with the function(s) to plot.`,
    `  The app renders the graph automatically — DO NOT add "Tracer la courbe de f" as a sub-question.`,
    `  expression syntax: valid JavaScript (use ** for powers, Math.sin, Math.exp, Math.abs, etc.)`,
    `  Example: { expression: "x**2 - 3*x + 2", label: "f", xMin: -1, xMax: 4 }`,
    ``,
    `Structural constraints:`,
    `  - The exam MUST have EXACTLY 4 exercises.`,
    `  - sum(exercises[i].totalPoints) MUST equal ${totalPoints} exactly.`,
    `  - Each exercise MUST have ONE synthesis sub-question (the objective).`,
    `  - Each exercise MUST have at least 2 numbered parts, each with at least 1 sub-question.`,
    `  - ALL sub-questions must chain: each uses the result of the previous.`,
    `    Enchaining is shown through the STRUCTURE and the synthesis question ("En déduire...",`,
    `    "Conclure...") — NOT through method references in individual question wordings.`,
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
  section?: string;
  language?: string;
  writingSubject: WritingSubject;
  profile?: CurriculumProfile | null;
  ragContext?: string;
}

export function buildWritingAnalysisPrompt(
  args: BuildWritingAnalysisPromptArgs,
): string {
  const { country, gradeLevel, section, language, writingSubject, profile, ragContext } =
    args;

  const subjectLabel = WRITING_SUBJECT_LABELS[writingSubject];
  const language_ =
    language ?? profile?.defaultLanguage ?? "the student's language";
  const subjectInstruction = WRITING_SUBJECT_INSTRUCTIONS[writingSubject];

  const sectionLine = section
    ? `Section / track: ${section} — adapt vocabulary, register, and examples to this filière.`
    : null;

  const curriculumBlock = profile
    ? [
        `A curated curriculum profile is provided for ${profile.countryName ?? country}. Follow it strictly.`,
        sectionLine,
        profile.notation ? `Language conventions: ${profile.notation}` : null,
        profile.conventions ? `Conventions: ${profile.conventions}` : null,
        profile.referenceBooks?.length
          ? `Reference books (cite when relevant): ${profile.referenceBooks.join("; ")}`
          : null,
        profile.notes ? `Additional notes: ${profile.notes}` : null,
      ]
        .filter(Boolean)
        .join("\n")
    : [
        `No curated profile is provided. Use your best knowledge of the ${country} language arts curriculum — the official standards, conventions, and pedagogical expectations — for a student${gradeLevel ? ` at ${gradeLevel} level` : ""}${section ? ` (${section})` : ""}.`,
        sectionLine,
      ]
        .filter(Boolean)
        .join("\n");

  return [
    `You are a patient, expert ${subjectLabel} tutor.`,
    `Audience: a student in ${country}${gradeLevel ? `, grade ${gradeLevel}` : ""}${section ? ` (${section})` : ""}.`,
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
  section?: string;
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
    section,
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
  const audienceDesc = `${country}${gradeLevel ? ` grade ${gradeLevel}` : ""}${section ? ` (${section})` : ""} students`;

  const curriculumNote = [
    profile
      ? `Follow the ${profile.countryName ?? country} language arts curriculum strictly.`
      : `Follow the official ${country} language arts curriculum and use vocabulary, examples, and conventions that ${audienceDesc} would recognise.`,
    section
      ? `Section / track: ${section} — adapt vocabulary, register, and examples to this filière.`
      : null,
  ]
    .filter(Boolean)
    .join("\n");

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

// ── Fiche pédagogique ─────────────────────────────────────────────────────────

const FICHE_JSON_CONTRACT = `
Return a single JSON object that strictly follows this TypeScript shape:

interface FicheParagraphe {
  titre: string;           // e.g. "I/ Définitions et vocabulaire"
  demarche: string[];      // numbered pedagogical steps, each a short instruction
  contenu: string;         // full markdown content: definitions, theorems, examples
  retenons?: string[];     // 1-5 boxed key takeaways starting with "Retenons :"
  applications?: string[]; // short exercise prompts for this paragraph
}
interface FicheSeance {
  numero: number;          // 1-based séance number
  duree: string;           // e.g. "2h"
  aptitudes: string[];     // 3-6 bullet learning objectives (infinitive form)
  paragraphes: FicheParagraphe[];
}
interface FichePedagogique {
  chapitre: string;        // chapter title
  niveau: string;          // grade level, e.g. "1ère A.S", "Terminale", "Grade 12"
  seances: FicheSeance[];  // ordered list of séances
  serie?: {                // optional final exercise series
    theme: string;
    exercices: { enonce: string; questions: string[] }[];
  };
}

Rules:
• Write all text in the requested language (default: French for TN/FR, Arabic/French for TN, English otherwise).
• Each séance covers ~2 hours of classroom time.
• demarche steps are SHORT headings (what the teacher does/says), NOT full prose.
• contenu is the full didactic content — use Markdown bold for definitions and theorem names, bullet lists for properties, numbered lists for proofs/examples.
• retenons items must begin with "Retenons :" and state the key rule/theorem concisely (the teacher writes this on the board).
• applications are short, concrete exercise prompts (not full solutions).
• serie.exercices should be 2-4 varied exercises covering the whole chapter.
• Do NOT include solutions in applications or serie — only problem statements.
• Return ONLY the JSON object, no markdown fences.`.trim();

export interface BuildFichePromptArgs {
  subject: string;
  topic: string;
  country: string;
  gradeLevel?: string;
  section?: string;
  language?: string;
  nbSeances: number;
  profile?: CurriculumProfile | null;
  ragContext?: string;
}

export function buildFichePrompt(args: BuildFichePromptArgs): string {
  const { subject, topic, country, gradeLevel, section, language, nbSeances, profile, ragContext } = args;

  const subjectLabel = SUBJECT_LABELS[subject as Subject] ?? subject;
  const language_ = language ?? profile?.defaultLanguage ?? (
    country === "TN" || country === "DZ" || country === "MA" ? "French" : "the curriculum language"
  );

  const curriculumBlock = renderCurriculumBlock(
    profile,
    country,
    subjectLabel,
    gradeLevel,
    section,
  );

  const audienceDesc = [
    country,
    gradeLevel,
    section,
  ].filter(Boolean).join(", ");

  return [
    `You are an expert ${subjectLabel} teacher creating a detailed pedagogical lesson-plan sheet ("fiche pédagogique") for the chapter "${topic}".`,
    `Audience: ${audienceDesc}.`,
    `Output language: ${language_}.`,
    `Number of séances to generate: ${nbSeances} (each ~2h).`,
    ``,
    `Curriculum context:`,
    curriculumBlock,
    ragContext ? `\n${ragContext}` : "",
    ``,
    `The fiche pédagogique must follow the Tunisian / French pedagogical tradition:`,
    `  • Each séance has a header table (aptitudes à développer, démarche column, durée column).`,
    `  • Paragraphs are numbered (I, II, III…) with Roman numerals as typically used in Tunisian math fiches.`,
    `  • Definitions, remarques, propriétés, and théorèmes are clearly labeled.`,
    `  • "Retenons" boxes summarise the essential rules for the student to copy into their notebook.`,
    `  • Applications refer to in-class exercises by number (e.g. "Exercice 1 Série I").`,
    `  • The final série d'exercices covers all paragraphs of the chapter.`,
    ``,
    FICHE_JSON_CONTRACT,
  ]
    .filter((line) => line !== "")
    .join("\n");
}
