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

export interface ExamQuestion {
  type: "direct" | "indirect" | "synthesis";
  question: string;
  points: number;
  solution: Solution;
  rubric?: string;
}

export interface Exam {
  title: string;
  durationMinutes?: number;
  questions: ExamQuestion[];
  totalPoints: number;
}
