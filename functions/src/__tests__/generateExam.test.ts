import { describe, expect, it } from "vitest";
import { validateExamDistribution } from "../generateExam";
import type { Exam, ExamSubpart } from "../schema";

const minSolution = {
  restatement: "Test problem",
  assumptions: [],
  steps: [{ title: "Step 1", expression: "x = 1", explanation: "Given." }],
  finalAnswer: "1",
};

function makeSubpart(
  letter: string,
  type: ExamSubpart["type"],
  points: number,
): ExamSubpart {
  return { letter, type, question: "Q?", points, solution: minSolution };
}

// Dummy exercise with 0 pts used to pad to exactly 4 exercises.
// validateExamDistribution skips exercises with 0 exercisePts, so these are inert.
const DUMMY_EXERCISE = {
  title: "Exercice dummy",
  totalPoints: 0,
  context: "Context.",
  parts: [{ number: "1", subparts: [makeSubpart("a", "direct", 0)] }],
};

/** Build an exam with one real exercise plus 3 inert fillers (totalPoints = 4 always). */
function makeExamOneExercise(
  subpartDefs: Array<{ type: ExamSubpart["type"]; points: number }>,
  totalPoints?: number,
): Exam {
  const subparts = subpartDefs.map((d, i) =>
    makeSubpart(String.fromCharCode(97 + i), d.type, d.points),
  );
  const exercisePts = subparts.reduce((s, sp) => s + sp.points, 0);
  return {
    title: "Test Exam",
    durationMinutes: 60,
    totalPoints: totalPoints ?? exercisePts,
    exercises: [
      {
        title: "Exercice 01",
        totalPoints: exercisePts,
        context: "Soit (u_n) une suite.",
        parts: [{ number: "1", subparts }],
      },
      DUMMY_EXERCISE,
      DUMMY_EXERCISE,
      DUMMY_EXERCISE,
    ],
  };
}

/** Build an exam with two real exercises plus 2 inert fillers (totalPoints = 4 always). */
function makeExamTwoExercises(
  ex1: Array<{ type: ExamSubpart["type"]; points: number }>,
  ex2: Array<{ type: ExamSubpart["type"]; points: number }>,
): Exam {
  const mk = (defs: typeof ex1, title: string) => {
    const subparts = defs.map((d, i) =>
      makeSubpart(String.fromCharCode(97 + i), d.type, d.points),
    );
    return {
      title,
      totalPoints: subparts.reduce((s, sp) => s + sp.points, 0),
      context: "Context.",
      parts: [{ number: "1", subparts }],
    };
  };
  const exercises = [mk(ex1, "Exercice 01"), mk(ex2, "Exercice 02"), DUMMY_EXERCISE, DUMMY_EXERCISE];
  return {
    title: "Test Exam",
    totalPoints: exercises.reduce((s, e) => s + e.totalPoints, 0),
    exercises,
  };
}

describe("validateExamDistribution", () => {
  it("returns null for a valid 60/20/20 subpart split in one exercise", () => {
    // 6 pts direct, 2 pts indirect, 2 pts synthesis = 60/20/20
    const exam = makeExamOneExercise([
      { type: "direct", points: 3 },
      { type: "direct", points: 3 },
      { type: "indirect", points: 2 },
      { type: "synthesis", points: 2 },
    ]);
    expect(validateExamDistribution(exam, 10)).toBeNull();
  });

  it("returns null when distribution is within ±15% tolerance per exercise", () => {
    // 55% direct, 20% indirect, 25% synthesis — within ±15%
    const exam = makeExamOneExercise([
      { type: "direct", points: 11 },
      { type: "indirect", points: 4 },
      { type: "synthesis", points: 5 },
    ]);
    expect(validateExamDistribution(exam, 20)).toBeNull();
  });

  it("returns null for valid distribution across two exercises independently", () => {
    const exam = makeExamTwoExercises(
      [
        { type: "direct", points: 6 },
        { type: "indirect", points: 2 },
        { type: "synthesis", points: 2 },
      ],
      [
        { type: "direct", points: 12 },
        { type: "indirect", points: 4 },
        { type: "synthesis", points: 4 },
      ],
    );
    expect(validateExamDistribution(exam, 30)).toBeNull();
  });

  it("returns error when total point sum does not match totalPoints", () => {
    const exam = makeExamOneExercise(
      [
        { type: "direct", points: 6 },
        { type: "indirect", points: 2 },
        { type: "synthesis", points: 2 },
      ],
      999,
    );
    const err = validateExamDistribution(exam, 999);
    expect(err).not.toBeNull();
    expect(err).toContain("10");
    expect(err).toContain("999");
  });

  it("returns error when direct ratio is too low in an exercise", () => {
    // 30% direct, 40% indirect, 30% synthesis — direct too low
    const exam = makeExamOneExercise([
      { type: "direct", points: 3 },
      { type: "indirect", points: 4 },
      { type: "synthesis", points: 3 },
    ]);
    const err = validateExamDistribution(exam, 10);
    expect(err).not.toBeNull();
    expect(err).toContain("~60%");
  });

  it("returns error when synthesis ratio is too high in an exercise", () => {
    // 60% direct, 0% indirect, 40% synthesis
    const exam = makeExamOneExercise([
      { type: "direct", points: 6 },
      { type: "synthesis", points: 4 },
    ]);
    const err = validateExamDistribution(exam, 10);
    expect(err).not.toBeNull();
  });

  it("works correctly with 50-point exam (30/10/10)", () => {
    const exam = makeExamOneExercise([
      { type: "direct", points: 18 },
      { type: "direct", points: 12 },
      { type: "indirect", points: 10 },
      { type: "synthesis", points: 10 },
    ]);
    expect(validateExamDistribution(exam, 50)).toBeNull();
  });
});
