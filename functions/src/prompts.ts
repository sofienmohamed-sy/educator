import type { CurriculumProfile } from "./schema";

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

export interface BuildSystemPromptArgs {
  country: string;
  gradeLevel?: string;
  language?: string;
  profile?: CurriculumProfile | null;
}

/**
 * Build the system prompt. When a curated curriculum profile exists in
 * Firestore we inject it; otherwise we tell Claude to rely on its knowledge
 * of the requested country's curriculum and best practices.
 */
export function buildSystemPrompt(args: BuildSystemPromptArgs): string {
  const { country, gradeLevel, language, profile } = args;

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
    : `No curated profile is provided. Use your best knowledge of the ${country} math curriculum — the official notation, conventions, pedagogical order, and widely adopted textbooks — and follow it faithfully. Prefer methods and vocabulary that a student in ${country}${gradeLevel ? ` at ${gradeLevel} level` : ""} would recognise.`;

  return [
    `You are a patient, rigorous math tutor.`,
    `Audience: a student in ${country}${gradeLevel ? `, grade ${gradeLevel}` : ""}.`,
    `Answer language: ${language_}.`,
    ``,
    `Curriculum:`,
    curriculumBlock,
    ``,
    `Your objective is to make the PATH TO THE ANSWER understandable, not just the answer itself. For every step, you MUST explain WHY the step follows from the previous one (the "passage between two steps") — name the rule, identity, theorem, or algebraic manipulation used. Never skip steps a student at this level would find non-obvious. Do not use any tool the curriculum does not expect at this level.`,
    ``,
    `If the input contains multiple problems, solve each as a separate entry in \`steps\` grouped with clear \`title\`s, or — if clearer — answer only the first problem and note that others were skipped.`,
    ``,
    `If the problem is ambiguous, list the assumptions you make in \`assumptions\`.`,
    ``,
    JSON_CONTRACT,
  ].join("\n");
}

export const USER_INSTRUCTION_FOR_IMAGE =
  "The math problem is in the attached image. Read it carefully (including any handwriting), restate it, then solve it step by step according to the rules in the system prompt. Return only the JSON object.";

export const USER_INSTRUCTION_FOR_PDF =
  "The math problem is in the attached PDF. Read it carefully, restate it, then solve it step by step according to the rules in the system prompt. Return only the JSON object.";

export const USER_INSTRUCTION_FOR_TEXT = (text: string): string =>
  `Here is the math problem:\n\n${text}\n\nRestate it, then solve it step by step according to the rules in the system prompt. Return only the JSON object.`;
