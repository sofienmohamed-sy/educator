import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";
import type {
  UserProfile,
  BookMeta,
  Course,
  Exercise,
  Exam,
  Subject,
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
    language?: string;
    totalPoints: number;
    bookIds?: string[];
  },
  { id: string; exam: Exam }
>(functions, "generateExam");
