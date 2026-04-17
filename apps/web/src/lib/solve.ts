import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";
import type { Solution } from "../components/StepList";
import type { Subject } from "./types";

export interface SolveRequest {
  country: string;
  gradeLevel?: string;
  language?: string;
  subject?: Subject;
  bookIds?: string[];
  input:
    | { kind: "text"; text: string }
    | { kind: "storage"; path: string; contentType: string };
}

export interface SolveResponse {
  id: string;
  solution: Solution;
  usedCuratedCurriculum: boolean;
}

const callable = httpsCallable<SolveRequest, SolveResponse>(functions, "solveProblem");

export async function solveProblem(req: SolveRequest): Promise<SolveResponse> {
  const { data } = await callable(req);
  return data;
}
