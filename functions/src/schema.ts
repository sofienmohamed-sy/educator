import { z } from "zod";

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Firebase Callable SDK serialises `undefined` values as `null` on the wire
 * (see `encode()` in @firebase/functions). Use these helpers for optional
 * request fields so both `null` and `undefined` are accepted.
 */
const nullishString = (opts: { min?: number; max?: number } = {}) => {
  let s = z.string().trim();
  if (opts.min !== undefined) s = s.min(opts.min);
  if (opts.max !== undefined) s = s.max(opts.max);
  return s.nullish().transform((v) => v ?? undefined);
};

const nullishArray = <T extends z.ZodTypeAny>(item: T, max?: number) => {
  let a = z.array(item);
  if (max !== undefined) a = a.max(max);
  return a.nullish().transform((v) => v ?? undefined);
};

// Helpers for Claude *response* schemas — models sometimes return null for
// optional fields even when the prompt says to omit them.
const rspOptStr = () => z.string().nullish().transform((v) => v ?? undefined);
const rspOptArr = <T extends z.ZodTypeAny>(item: T) =>
  z.array(item).nullish().transform((v) => v ?? undefined);
const rspDefArr = <T extends z.ZodTypeAny>(item: T) =>
  z.array(item).nullish().transform((v) => v ?? []);

// ── Subject ───────────────────────────────────────────────────────────────────

export const subjectSchema = z.enum([
  "math",
  "physics",
  "chemistry",
  "informatics",
]);
export type Subject = z.infer<typeof subjectSchema>;

// ── Solve problem ─────────────────────────────────────────────────────────────

/** Request body for the `solveProblem` callable. */
export const solveRequestSchema = z.object({
  country: z
    .string()
    .trim()
    .min(2)
    .max(8)
    .describe("ISO-3166 alpha-2 country code, e.g. 'FR', 'US', 'MA'."),
  gradeLevel: nullishString({ max: 64 }),
  section: nullishString({ max: 96 }),
  language: nullishString({ min: 2, max: 16 }),
  model: z
    .enum(["claude-opus-4-7", "claude-sonnet-4-6"])
    .nullish()
    .transform((v) => v ?? undefined),
  subject: subjectSchema.nullish().transform((v) => v ?? undefined),
  bookIds: nullishArray(z.string().min(1), 5),
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

// ── Graph spec (shared by solutions, exercises, and exams) ───────────────────

export const graphFunctionSchema = z.object({
  expression: z.string().min(1),
  label: rspOptStr(),
  color: rspOptStr(),
});

export const graphSpecSchema = z.object({
  functions: z.array(graphFunctionSchema).min(1),
  xMin: z.number().default(-5),
  xMax: z.number().default(5),
  caption: rspOptStr(),
});
export type GraphFunction = z.infer<typeof graphFunctionSchema>;
export type GraphSpec = z.infer<typeof graphSpecSchema>;

// ── Solution ──────────────────────────────────────────────────────────────────

/** Shape Claude is asked to return. */
export const solutionStepSchema = z.object({
  title: z.string(),
  expression: z.string(),
  explanation: z.string(),
  ruleOrTheorem: rspOptStr(),
});

export const solutionSchema = z.object({
  restatement: z.string(),
  assumptions: rspDefArr(z.string()),
  steps: z.array(solutionStepSchema).min(1),
  finalAnswer: z.string(),
  verification: rspOptStr(),
  graphs: rspOptArr(graphSpecSchema),
});

export type Solution = z.infer<typeof solutionSchema>;
export type SolutionStep = z.infer<typeof solutionStepSchema>;

/** Curriculum profile — static (curriculaData.ts) or Firestore override. */
export const curriculumProfileSchema = z.object({
  countryCode: z.string(),
  countryName: z.string().optional(),
  defaultLanguage: z.string().optional(),
  subject: subjectSchema.optional(),

  // ── Math / notation structured fields ──────────────────────────────────────
  decimalSeparator: z.enum(["comma", "dot"]).optional(),
  intervalNotation: z.enum(["french", "standard"]).optional(),
  logConvention: z.enum(["ln_only", "log_base10", "both"]).optional(),
  derivativeNotation: z.enum(["prime", "leibniz", "both"]).optional(),
  proofCulture: z.enum(["high", "medium", "low"]).optional(),
  calculatorPolicy: z.enum(["forbidden", "scientific", "graphing"]).optional(),

  // ── Physics structured fields ───────────────────────────────────────────────
  gValue: z.number().optional(),
  vectorNotation: z.enum(["arrow_only", "bold", "both"]).optional(),
  formulaSheet: z.boolean().optional(),

  // ── Chemistry structured fields ─────────────────────────────────────────────
  waterIonizationConstant: z.enum(["Ke", "Kw"]).optional(),
  concentrationUnit: z.enum(["mol_per_L", "mol_per_dm3"]).optional(),
  arrowPushingMechanisms: z.boolean().optional(),
  combinedPhysicsChem: z.boolean().optional(),

  // ── Free-form curriculum text (injected verbatim into prompts) ──────────────
  notation: z.string().optional(),
  conventions: z.string().optional(),
  stepStyle: z.string().optional(),
  examFormat: z.string().optional(),
  exerciseStyle: z.string().optional(),
  referenceBooks: z.array(z.string()).optional(),
  gradeLevels: z.array(z.string()).optional(),
  notes: z.string().optional(),
  specialRules: z.array(z.string()).optional(),
});

export type CurriculumProfile = z.infer<typeof curriculumProfileSchema>;

// ── User profile ──────────────────────────────────────────────────────────────

export const userProfileSchema = z.object({
  role: z.enum(["student", "professor"]),
  defaultCountry: z.string().trim().min(2).max(8).optional(),
  defaultGradeLevel: z.string().trim().max(64).optional(),
  preferredLanguage: z.string().trim().min(2).max(16).optional(),
  createdAt: z.any().optional(),
  updatedAt: z.any().optional(),
});
export type UserProfile = z.infer<typeof userProfileSchema>;

// ── Book library ──────────────────────────────────────────────────────────────

export const bookMetaSchema = z.object({
  title: z.string().trim().min(1).max(256),
  subject: subjectSchema,
  country: z.string().trim().min(2).max(8),
  gradeLevel: z.string().trim().max(64).optional(),
  language: z.string().trim().min(2).max(16).optional(),
  storagePath: z.string().min(1),
  uploadedBy: z.string().min(1),
  status: z.enum(["pending", "processing", "ready", "error"]),
  chunkCount: z.number().int().nonnegative().optional(),
  errorMessage: z.string().optional(),
  createdAt: z.any().optional(),
  updatedAt: z.any().optional(),
});
export type BookMeta = z.infer<typeof bookMetaSchema>;

export const bookChunkSchema = z.object({
  bookId: z.string().min(1),
  chunkIndex: z.number().int().nonnegative(),
  text: z.string().min(1),
  pageHint: z.number().int().nonnegative().optional(),
});
export type BookChunk = z.infer<typeof bookChunkSchema>;

/** RAG chunk returned from vector search, enriched with book title. */
export interface RagChunk {
  text: string;
  bookTitle: string;
  pageHint?: number;
  chunkIndex?: number;
}

// ── Course generation ─────────────────────────────────────────────────────────

export const generateCourseRequestSchema = z.object({
  subject: subjectSchema,
  topic: z.string().trim().min(1).max(4096),
  country: z.string().trim().min(2).max(8),
  gradeLevel: nullishString({ max: 64 }),
  section: nullishString({ max: 96 }),
  language: nullishString({ min: 2, max: 16 }),
  bookIds: nullishArray(z.string().min(1), 5),
});
export type GenerateCourseRequest = z.infer<typeof generateCourseRequestSchema>;

export const courseSchema = z.object({
  subject: subjectSchema.nullish().transform((v) => v ?? undefined),
  topic: rspOptStr(),
  theory: z.string().min(1),
  keyConcepts: rspDefArr(z.object({ term: z.string(), definition: z.string() })),
  workedExamples: rspDefArr(z.object({ problem: z.string(), solution: z.string() })),
  summary: z.string().min(1),
});
export type Course = z.infer<typeof courseSchema>;

// ── Exercise generation ───────────────────────────────────────────────────────

export const generateExercisesRequestSchema = z.object({
  subject: subjectSchema,
  topic: z.string().trim().min(1).max(4096),
  country: z.string().trim().min(2).max(8),
  gradeLevel: nullishString({ max: 64 }),
  section: nullishString({ max: 96 }),
  language: nullishString({ min: 2, max: 16 }),
  difficulty: z.enum(["easy", "medium", "hard"]),
  count: z.number().int().min(1).max(20).default(5),
  bookIds: nullishArray(z.string().min(1), 5),
});
export type GenerateExercisesRequest = z.infer<
  typeof generateExercisesRequestSchema
>;

export const exerciseSchema = z.object({
  question: z.string().min(1),
  hints: rspOptArr(z.string()),
  solution: solutionSchema,
});
export const exercisesResponseSchema = z.object({
  exercises: z.array(exerciseSchema).min(1),
});
export type Exercise = z.infer<typeof exerciseSchema>;

// ── Exam generation ───────────────────────────────────────────────────────────

export const generateExamRequestSchema = z.object({
  subject: subjectSchema,
  topics: z.array(z.string().trim().min(1)).min(1).max(10),
  country: z.string().trim().min(2).max(8),
  gradeLevel: nullishString({ max: 64 }),
  section: nullishString({ max: 96 }),
  language: nullishString({ min: 2, max: 16 }),
  totalPoints: z.number().min(10).max(200).default(20),
  bookIds: nullishArray(z.string().min(1), 5),
});
export type GenerateExamRequest = z.infer<typeof generateExamRequestSchema>;

export const examSubpartSchema = z.object({
  letter: z.string().min(1),
  type: z.enum(["direct", "indirect", "synthesis"]),
  question: z.string().min(1),
  points: z
    .number()
    .min(0.25)
    .refine((v) => Math.abs(Math.round(v * 4) - v * 4) < 0.001, {
      message: "points must be a multiple of 0.25",
    }),
  solution: solutionSchema,
  rubric: rspOptStr(),
});

export const examPartSchema = z.object({
  number: z.string().min(1),
  subparts: z.array(examSubpartSchema).min(1),
});

export const examExerciseSchema = z.object({
  title: z.string().min(1),
  totalPoints: z.number().positive(),
  context: z.string().min(1),
  graphs: rspOptArr(graphSpecSchema),
  parts: z.array(examPartSchema).min(1),
});

export const examSchema = z.object({
  title: z.string().min(1),
  durationMinutes: z.number().int().positive().nullish().transform((v) => v ?? undefined),
  totalPoints: z.number().int().positive(),
  exercises: z.array(examExerciseSchema).min(4).max(4),
});

export type ExamSubpart = z.infer<typeof examSubpartSchema>;
export type ExamPart = z.infer<typeof examPartSchema>;
export type ExamExercise = z.infer<typeof examExerciseSchema>;
export type Exam = z.infer<typeof examSchema>;

// ── Writing subject ───────────────────────────────────────────────────────────

export const writingSubjectSchema = z.enum([
  "grammar",
  "essay",
  "vocabulary",
  "literature",
  "reading",
]);
export type WritingSubject = z.infer<typeof writingSubjectSchema>;

// ── Solve writing ─────────────────────────────────────────────────────────────

export const solveWritingRequestSchema = z.object({
  country: z
    .string()
    .trim()
    .min(2)
    .max(8)
    .describe("ISO-3166 alpha-2 country code, e.g. 'FR', 'US', 'MA'."),
  gradeLevel: nullishString({ max: 64 }),
  section: nullishString({ max: 96 }),
  language: nullishString({ min: 2, max: 16 }),
  model: z
    .enum(["claude-opus-4-7", "claude-sonnet-4-6"])
    .nullish()
    .transform((v) => v ?? undefined),
  writingSubject: writingSubjectSchema,
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
export type SolveWritingRequest = z.infer<typeof solveWritingRequestSchema>;

export const writingCorrectionSchema = z.object({
  original: z.string(),
  corrected: z.string(),
  explanation: z.string(),
});

export const writingAnalysisSchema = z.object({
  restatement: z.string(),
  feedback: z.string().min(1),
  corrections: rspDefArr(writingCorrectionSchema),
  suggestions: rspDefArr(z.string()),
  conclusion: z.string(),
});
export type WritingAnalysis = z.infer<typeof writingAnalysisSchema>;
export type WritingCorrection = z.infer<typeof writingCorrectionSchema>;

// ── Generate writing content ──────────────────────────────────────────────────

export const generateWritingRequestSchema = z.object({
  writingSubject: writingSubjectSchema,
  contentType: z.enum(["lesson", "exercise", "quiz", "essay_prompt"]),
  topic: z.string().trim().min(1).max(4096),
  country: z.string().trim().min(2).max(8),
  gradeLevel: nullishString({ max: 64 }),
  section: nullishString({ max: 96 }),
  language: nullishString({ min: 2, max: 16 }),
  difficulty: z
    .enum(["easy", "medium", "hard"])
    .nullish()
    .transform((v) => v ?? undefined),
  count: z
    .number()
    .int()
    .min(1)
    .max(20)
    .nullish()
    .transform((v) => v ?? undefined),
});
export type GenerateWritingRequest = z.infer<typeof generateWritingRequestSchema>;

export const writingItemSchema = z.object({
  prompt: z.string().min(1),
  hints: rspOptArr(z.string()),
  answer: z.string().min(1),
  explanation: z.string().min(1),
});

export const writingContentSchema = z.object({
  title: z.string().min(1),
  contentType: z.enum(["lesson", "exercise", "quiz", "essay_prompt"]),
  writingSubject: writingSubjectSchema,
  theory: rspOptStr(),
  keyConcepts: rspOptArr(z.object({ term: z.string(), definition: z.string() })),
  items: rspOptArr(writingItemSchema),
  prompt: rspOptStr(),
  criteria: rspOptArr(z.string()),
  tips: rspOptArr(z.string()),
  summary: rspOptStr(),
});
export type WritingContent = z.infer<typeof writingContentSchema>;
export type WritingItem = z.infer<typeof writingItemSchema>;

// ── Fiche pédagogique ─────────────────────────────────────────────────────────
// Models a "fiche pédagogique" (teacher lesson-plan sheet) in the Tunisian /
// French style: one per chapter, broken into séances (~2h each), each séance
// containing paragraphes with pedagogical steps (démarche), content, "Retenons"
// boxes, and applications. A final Série d'exercices is optional.

export const generateFicheRequestSchema = z.object({
  subject: subjectSchema,
  topic: z.string().trim().min(1).max(4096),
  country: z.string().trim().min(2).max(8),
  gradeLevel: nullishString({ max: 64 }),
  section: nullishString({ max: 96 }),
  language: nullishString({ min: 2, max: 16 }),
  nbSeances: z
    .number()
    .int()
    .min(1)
    .max(6)
    .nullish()
    .transform((v) => v ?? 2),
  bookIds: nullishArray(z.string().min(1), 5),
});
export type GenerateFicheRequest = z.infer<typeof generateFicheRequestSchema>;

const ficheParagrapheSchema = z.object({
  titre: z.string().min(1),
  demarche: rspDefArr(z.string()),
  contenu: z.string().min(1),
  retenons: rspOptArr(z.string()),
  applications: rspOptArr(z.string()),
});

const ficheSeanceSchema = z.object({
  numero: z.number().int().min(1),
  duree: z.string().min(1),
  aptitudes: rspDefArr(z.string()),
  paragraphes: rspDefArr(ficheParagrapheSchema),
});

const ficheExerciceSchema = z.object({
  enonce: z.string().min(1),
  questions: rspDefArr(z.string()),
});

export const fichePedagogiqueSchema = z.object({
  chapitre: z.string().min(1),
  niveau: z.string().min(1),
  seances: z.array(ficheSeanceSchema).min(1),
  serie: z
    .object({
      theme: z.string().min(1),
      exercices: z.array(ficheExerciceSchema).min(1),
    })
    .nullish()
    .transform((v) => v ?? undefined),
});
export type FichePedagogique = z.infer<typeof fichePedagogiqueSchema>;

// ── processBook callable ──────────────────────────────────────────────────────

export const processBookRequestSchema = z.object({
  bookId: z.string().trim().min(1),
});

// ── createBook callable ───────────────────────────────────────────────────────

export const createBookRequestSchema = z.object({
  title: z.string().trim().min(1).max(256),
  subject: subjectSchema,
  country: z.string().trim().min(2).max(8),
  gradeLevel: z.string().trim().max(64).optional(),
  language: z.string().trim().min(2).max(16).optional(),
});
export type CreateBookRequest = z.infer<typeof createBookRequestSchema>;

// ── listBooks callable ────────────────────────────────────────────────────────

export const listBooksRequestSchema = z.object({
  subject: subjectSchema.nullish().transform((v) => v ?? undefined),
  country: nullishString({ min: 2, max: 8 }),
});
export type ListBooksRequest = z.infer<typeof listBooksRequestSchema>;

// ── updateProfile callable ────────────────────────────────────────────────────

export const updateProfileRequestSchema = userProfileSchema
  .pick({
    role: true,
    defaultCountry: true,
    defaultGradeLevel: true,
    preferredLanguage: true,
  })
  .partial();
export type UpdateProfileRequest = z.infer<typeof updateProfileRequestSchema>;
