import { z } from "zod";

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
  gradeLevel: z.string().trim().max(64).optional(),
  language: z.string().trim().min(2).max(16).optional(),
  model: z.enum(["claude-opus-4-6", "claude-sonnet-4-6"]).optional(),
  subject: subjectSchema.optional(),
  bookIds: z.array(z.string().min(1)).max(5).optional(),
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
}

// ── Course generation ─────────────────────────────────────────────────────────

export const generateCourseRequestSchema = z.object({
  subject: subjectSchema,
  topic: z.string().trim().min(1).max(256),
  country: z.string().trim().min(2).max(8),
  gradeLevel: z.string().trim().max(64).optional(),
  language: z.string().trim().min(2).max(16).optional(),
  bookIds: z.array(z.string().min(1)).max(5).optional(),
});
export type GenerateCourseRequest = z.infer<typeof generateCourseRequestSchema>;

export const courseSchema = z.object({
  subject: subjectSchema,
  topic: z.string(),
  theory: z.string().min(1),
  keyConcepts: z
    .array(z.object({ term: z.string(), definition: z.string() }))
    .min(1),
  workedExamples: z
    .array(z.object({ problem: z.string(), solution: z.string() }))
    .min(1),
  summary: z.string().min(1),
});
export type Course = z.infer<typeof courseSchema>;

// ── Exercise generation ───────────────────────────────────────────────────────

export const generateExercisesRequestSchema = z.object({
  subject: subjectSchema,
  topic: z.string().trim().min(1).max(256),
  country: z.string().trim().min(2).max(8),
  gradeLevel: z.string().trim().max(64).optional(),
  language: z.string().trim().min(2).max(16).optional(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  count: z.number().int().min(1).max(20).default(5),
  bookIds: z.array(z.string().min(1)).max(5).optional(),
});
export type GenerateExercisesRequest = z.infer<
  typeof generateExercisesRequestSchema
>;

export const exerciseSchema = z.object({
  question: z.string().min(1),
  hints: z.array(z.string()).optional(),
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
  gradeLevel: z.string().trim().max(64).optional(),
  language: z.string().trim().min(2).max(16).optional(),
  totalPoints: z.number().int().min(20).max(200).default(100),
  bookIds: z.array(z.string().min(1)).max(5).optional(),
});
export type GenerateExamRequest = z.infer<typeof generateExamRequestSchema>;

export const examQuestionSchema = z.object({
  type: z.enum(["direct", "indirect", "synthesis"]),
  question: z.string().min(1),
  points: z.number().int().min(1),
  solution: solutionSchema,
  rubric: z.string().optional(),
});
export const examSchema = z.object({
  title: z.string().min(1),
  durationMinutes: z.number().int().positive().optional(),
  questions: z.array(examQuestionSchema).min(1),
  totalPoints: z.number().int().positive(),
});
export type ExamQuestion = z.infer<typeof examQuestionSchema>;
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
  gradeLevel: z.string().trim().max(64).optional(),
  language: z.string().trim().min(2).max(16).optional(),
  model: z.enum(["claude-opus-4-6", "claude-sonnet-4-6"]).optional(),
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
  corrections: z.array(writingCorrectionSchema).default([]),
  suggestions: z.array(z.string()).default([]),
  conclusion: z.string(),
});
export type WritingAnalysis = z.infer<typeof writingAnalysisSchema>;
export type WritingCorrection = z.infer<typeof writingCorrectionSchema>;

// ── Generate writing content ──────────────────────────────────────────────────

export const generateWritingRequestSchema = z.object({
  writingSubject: writingSubjectSchema,
  contentType: z.enum(["lesson", "exercise", "quiz", "essay_prompt"]),
  topic: z.string().trim().min(1).max(256),
  country: z.string().trim().min(2).max(8),
  gradeLevel: z.string().trim().max(64).optional(),
  language: z.string().trim().min(2).max(16).optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  count: z.number().int().min(1).max(20).default(5).optional(),
});
export type GenerateWritingRequest = z.infer<typeof generateWritingRequestSchema>;

export const writingItemSchema = z.object({
  prompt: z.string().min(1),
  hints: z.array(z.string()).optional(),
  answer: z.string().min(1),
  explanation: z.string().min(1),
});

export const writingContentSchema = z.object({
  title: z.string().min(1),
  contentType: z.enum(["lesson", "exercise", "quiz", "essay_prompt"]),
  writingSubject: writingSubjectSchema,
  theory: z.string().optional(),
  keyConcepts: z
    .array(z.object({ term: z.string(), definition: z.string() }))
    .optional(),
  items: z.array(writingItemSchema).optional(),
  prompt: z.string().optional(),
  criteria: z.array(z.string()).optional(),
  tips: z.array(z.string()).optional(),
  summary: z.string().optional(),
});
export type WritingContent = z.infer<typeof writingContentSchema>;
export type WritingItem = z.infer<typeof writingItemSchema>;

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
  subject: subjectSchema.optional(),
  country: z.string().trim().min(2).max(8).optional(),
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
