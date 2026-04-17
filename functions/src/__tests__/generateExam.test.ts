import { describe, expect, it } from "vitest";
import { validateExamDistribution } from "../generateExam";
import type { Exam } from "../schema";

const minSolution = {
  restatement: "Test problem",
  assumptions: [],
  steps: [{ title: "Step 1", expression: "x = 1", explanation: "Given." }],
  finalAnswer: "1",
};

function makeExam(
  questions: Array<{ type: "direct" | "indirect" | "synthesis"; points: number }>,
): Exam {
  return {
    title: "Test Exam",
    durationMinutes: 60,
    totalPoints: questions.reduce((s, q) => s + q.points, 0),
    questions: questions.map((q) => ({
      type: q.type,
      question: "Question text",
      points: q.points,
      solution: minSolution,
    })),
  };
}

describe("validateExamDistribution", () => {
  it("returns null for a valid 60/20/20 split (100 pts)", () => {
    const exam = makeExam([
      { type: "direct", points: 60 },
      { type: "indirect", points: 20 },
      { type: "synthesis", points: 20 },
    ]);
    expect(validateExamDistribution(exam, 100)).toBeNull();
  });

  it("returns null for a valid 60/20/20 with multiple questions", () => {
    const exam = makeExam([
      { type: "direct", points: 20 },
      { type: "direct", points: 20 },
      { type: "direct", points: 20 },
      { type: "indirect", points: 10 },
      { type: "indirect", points: 10 },
      { type: "synthesis", points: 20 },
    ]);
    expect(validateExamDistribution(exam, 100)).toBeNull();
  });

  it("returns null for a valid distribution within ±5% tolerance", () => {
    // 58% direct, 22% indirect, 20% synthesis → within ±5%
    const exam = makeExam([
      { type: "direct", points: 58 },
      { type: "indirect", points: 22 },
      { type: "synthesis", points: 20 },
    ]);
    expect(validateExamDistribution(exam, 100)).toBeNull();
  });

  it("returns error when point sum does not match totalPoints", () => {
    const exam = makeExam([
      { type: "direct", points: 60 },
      { type: "indirect", points: 20 },
      { type: "synthesis", points: 15 },
    ]);
    const err = validateExamDistribution(exam, 100);
    expect(err).not.toBeNull();
    expect(err).toContain("95");
  });

  it("returns error when direct ratio is too low", () => {
    const exam = makeExam([
      { type: "direct", points: 40 },
      { type: "indirect", points: 30 },
      { type: "synthesis", points: 30 },
    ]);
    const err = validateExamDistribution(exam, 100);
    expect(err).not.toBeNull();
    expect(err).toContain("40%");
    expect(err).toContain("~60%");
  });

  it("returns error when indirect ratio is too high", () => {
    const exam = makeExam([
      { type: "direct", points: 60 },
      { type: "indirect", points: 35 },
      { type: "synthesis", points: 5 },
    ]);
    const err = validateExamDistribution(exam, 100);
    expect(err).not.toBeNull();
  });

  it("works correctly with 50-point exam", () => {
    const exam = makeExam([
      { type: "direct", points: 30 },
      { type: "indirect", points: 10 },
      { type: "synthesis", points: 10 },
    ]);
    expect(validateExamDistribution(exam, 50)).toBeNull();
  });
});
