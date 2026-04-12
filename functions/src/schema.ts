import { z } from "zod";

/** Request body for the `solveProblem` callable. */
export const solveRequestSchema = z.object({
  country: z
    .string()
    .trim()
    .min(2)
    .max(8)
    .describe("ISO-3166 alpha-2 country code, e.g. 'FR', 'US', 'MA'."),
  gradeLevel: z.string().trim().max(64).optional(),
  language: z.string().trim().min(2).max(16).optional(),
  model: z.enum(["claude-opus-4-6", "claude-sonnet-4-6"]).optional(),
  input: z.discriminatedUnion("kind", [
    z.object({
      kind: z.literal("text"),
      text: z.string().trim().min(1).max(10_000),
    }),
    z.object({
      kind: z.literal("storage"),
      path: z
        .string()
        .trim()
        .min(1)
        .max(512)
        .regex(/^uploads\/[^/]+\/.+/u, "path must be under uploads/{uid}/..."),
      contentType: z
        .string()
        .regex(
          /^(image\/(png|jpeg|jpg|webp|gif)|application\/pdf)$/u,
          "only images or PDFs are accepted",
        ),
    }),
  ]),
});

export type SolveRequest = z.infer<typeof solveRequestSchema>;

/** Shape Claude is asked to return. */
export const solutionStepSchema = z.object({
  title: z.string(),
  expression: z.string(),
  explanation: z.string(),
  ruleOrTheorem: z.string().optional(),
});

export const solutionSchema = z.object({
  restatement: z.string(),
  assumptions: z.array(z.string()).default([]),
  steps: z.array(solutionStepSchema).min(1),
  finalAnswer: z.string(),
  verification: z.string().optional(),
});

export type Solution = z.infer<typeof solutionSchema>;
export type SolutionStep = z.infer<typeof solutionStepSchema>;

/** Curriculum profile stored at `curricula/{countryCode}`. */
export const curriculumProfileSchema = z.object({
  countryCode: z.string(),
  countryName: z.string().optional(),
  defaultLanguage: z.string().optional(),
  notation: z.string().optional(),
  conventions: z.string().optional(),
  stepStyle: z.string().optional(),
  referenceBooks: z.array(z.string()).optional(),
  gradeLevels: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export type CurriculumProfile = z.infer<typeof curriculumProfileSchema>;
