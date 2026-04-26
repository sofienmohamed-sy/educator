import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";
import type {
  UserProfile,
  BookMeta,
  Course,
  Exercise,
  Exam,
  Subject,
  WritingSubject,
  WritingAnalysis,
  WritingContent,
} from "./types";

// ── Profile ───────────────────────────────────────────────────────────────────

export const updateProfileFn = httpsCallable<
  Partial<UserProfile>,
  { ok: boolean }
>(functions, "updateProfile");

export const getProfileFn = httpsCallable<Record<string, never>, UserProfile | null>(
  functions,
  "getProfile",
);

// ── Books ─────────────────────────────────────────────────────────────────────

export const createBookFn = httpsCallable<
  {
    title: string;
    subject: Subject;
    country: string;
    gradeLevel?: string;
    section?: string;
    language?: string;
  },
  { bookId: string; uploadPath: string }
>(functions, "createBook");

export const listBooksFn = httpsCallable<
  { subject?: Subject; country?: string },
  { books: BookMeta[] }
>(functions, "listBooks");

export const processBookFn = httpsCallable<{ bookId: string }, { ok: boolean }>(
  functions,
  "processBook",
);

// ── Generation ────────────────────────────────────────────────────────────────

export const generateCourseFn = httpsCallable<
  {
    subject: Subject;
    topic: string;
    country: string;
    gradeLevel?: string;
    section?: string;
    language?: string;
    bookIds?: string[];
  },
  { id: string; course: Course }
>(functions, "generateCourse");

export const generateExercisesFn = httpsCallable<
  {
    subject: Subject;
    topic: string;
    country: string;
    gradeLevel?: string;
    section?: string;
    language?: string;
    difficulty: "easy" | "medium" | "hard";
    count: number;
    bookIds?: string[];
  },
  { id: string; exercises: Exercise[] }
>(functions, "generateExercises");

export const generateExamFn = httpsCallable<
  {
    subject: Subject;
    topics: string[];
    country: string;
    gradeLevel?: string;
    section?: string;
    language?: string;
    totalPoints: number;
    bookIds?: string[];
  },
  { id: string; exam: Exam }
>(functions, "generateExam");

// ── Writing ───────────────────────────────────────────────────────────────────

export const solveWritingFn = httpsCallable<
  {
    country: string;
    gradeLevel?: string;
    section?: string;
    language?: string;
    writingSubject: WritingSubject;
    input:
      | { kind: "text"; text: string }
      | { kind: "storage"; path: string; contentType: string };
  },
  { id: string; analysis: WritingAnalysis; usedCuratedCurriculum: boolean }
>(functions, "solveWriting");

export const generateWritingFn = httpsCallable<
  {
    writingSubject: WritingSubject;
    contentType: "lesson" | "exercise" | "quiz" | "essay_prompt";
    topic: string;
    country: string;
    gradeLevel?: string;
    section?: string;
    language?: string;
    difficulty?: "easy" | "medium" | "hard";
    count?: number;
  },
  { id: string; content: WritingContent }
>(functions, "generateWriting");
