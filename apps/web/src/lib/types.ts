import type { Solution } from "../components/StepList";

export type Subject = "math" | "physics" | "chemistry" | "informatics";
export type UserRole = "student" | "professor";

export interface UserProfile {
  role: UserRole;
  defaultCountry?: string;
  defaultGradeLevel?: string;
  preferredLanguage?: string;
}

export interface BookMeta {
  id: string;
  title: string;
  subject: Subject;
  country: string;
  gradeLevel?: string;
  language?: string;
  uploadedBy: string;
  status: "pending" | "processing" | "ready" | "error";
  chunkCount?: number;
  errorMessage?: string;
  createdAt?: { seconds: number };
}

export interface Course {
  subject: Subject;
  topic: string;
  theory: string;
  keyConcepts: Array<{ term: string; definition: string }>;
  workedExamples: Array<{ problem: string; solution: string }>;
  summary: string;
}

export interface Exercise {
  question: string;
  hints?: string[];
  solution: Solution;
}

export interface ExamSubpart {
  letter: string;
  type: "direct" | "indirect" | "synthesis";
  question: string;
  points: number;
  solution: Solution;
  rubric?: string;
}

export interface ExamPart {
  number: string;
  subparts: ExamSubpart[];
}

export interface GraphFunction {
  expression: string;
  label?: string;
  color?: string;
}

export interface GraphSpec {
  functions: GraphFunction[];
  xMin: number;
  xMax: number;
  caption?: string;
}

export interface ExamExercise {
  title: string;
  totalPoints: number;
  context: string;
  graphs?: GraphSpec[];
  parts: ExamPart[];
}

export interface Exam {
  title: string;
  durationMinutes?: number;
  totalPoints: number;
  exercises: ExamExercise[];
}

// ── Writing ───────────────────────────────────────────────────────────────────

export type WritingSubject =
  | "grammar"
  | "essay"
  | "vocabulary"
  | "literature"
  | "reading";

export interface WritingCorrection {
  original: string;
  corrected: string;
  explanation: string;
}

export interface WritingAnalysis {
  restatement: string;
  feedback: string;
  corrections: WritingCorrection[];
  suggestions: string[];
  conclusion: string;
}

export interface WritingItem {
  prompt: string;
  hints?: string[];
  answer: string;
  explanation: string;
}

export interface WritingContent {
  title: string;
  contentType: "lesson" | "exercise" | "quiz" | "essay_prompt";
  writingSubject: WritingSubject;
  theory?: string;
  keyConcepts?: Array<{ term: string; definition: string }>;
  items?: WritingItem[];
  prompt?: string;
  criteria?: string[];
  tips?: string[];
  summary?: string;
}
