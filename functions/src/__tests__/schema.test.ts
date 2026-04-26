import { describe, expect, it } from "vitest";
import {
  solveRequestSchema,
  solutionSchema,
  generateCourseRequestSchema,
  generateExercisesRequestSchema,
  generateExamRequestSchema,
  examSchema,
  bookMetaSchema,
  userProfileSchema,
} from "../schema";

describe("solveRequestSchema", () => {
  it("accepts a valid text request", () => {
    const result = solveRequestSchema.safeParse({
      country: "FR",
      input: { kind: "text", text: "Solve 2x + 3 = 11" },
    });
    expect(result.success).toBe(true);
  });

  it("accepts a valid storage (image) request", () => {
    const result = solveRequestSchema.safeParse({
      country: "US",
      input: {
        kind: "storage",
        path: "uploads/abc123/foo.png",
        contentType: "image/png",
      },
    });
    expect(result.success).toBe(true);
  });

  it("rejects an upload path outside the uploads/ prefix", () => {
    const result = solveRequestSchema.safeParse({
      country: "US",
      input: {
        kind: "storage",
        path: "../../etc/passwd",
        contentType: "image/png",
      },
    });
    expect(result.success).toBe(false);
  });

  it("rejects unsupported content types", () => {
    const result = solveRequestSchema.safeParse({
      country: "US",
      input: {
        kind: "storage",
        path: "uploads/abc/foo.txt",
        contentType: "text/plain",
      },
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty text", () => {
    const result = solveRequestSchema.safeParse({
      country: "FR",
      input: { kind: "text", text: "" },
    });
    expect(result.success).toBe(false);
  });
});

describe("solutionSchema", () => {
  it("requires at least one step", () => {
    const result = solutionSchema.safeParse({
      restatement: "x",
      assumptions: [],
      steps: [],
      finalAnswer: "x=1",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a minimal valid solution", () => {
    const result = solutionSchema.safeParse({
      restatement: "Solve 2x+3=11",
      assumptions: [],
      steps: [
        {
          title: "Isolate x",
          expression: "2x = 8",
          explanation: "Subtract 3 from both sides.",
        },
      ],
      finalAnswer: "x = 4",
    });
    expect(result.success).toBe(true);
  });
});

describe("generateCourseRequestSchema", () => {
  it("accepts a valid request", () => {
    expect(
      generateCourseRequestSchema.safeParse({
        subject: "math",
        topic: "Quadratic equations",
        country: "FR",
        gradeLevel: "Terminale",
      }).success,
    ).toBe(true);
  });

  it("rejects invalid subject", () => {
    expect(
      generateCourseRequestSchema.safeParse({
        subject: "biology",
        topic: "Cells",
        country: "US",
      }).success,
    ).toBe(false);
  });

  it("rejects too many bookIds", () => {
    expect(
      generateCourseRequestSchema.safeParse({
        subject: "physics",
        topic: "Newton's laws",
        country: "US",
        bookIds: ["a", "b", "c", "d", "e", "f"],
      }).success,
    ).toBe(false);
  });
});

describe("generateExercisesRequestSchema", () => {
  it("accepts valid request with defaults", () => {
    const result = generateExercisesRequestSchema.safeParse({
      subject: "chemistry",
      topic: "Stoichiometry",
      country: "MA",
      difficulty: "medium",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.count).toBe(5);
  });

  it("rejects count > 20", () => {
    expect(
      generateExercisesRequestSchema.safeParse({
        subject: "math",
        topic: "Limits",
        country: "FR",
        difficulty: "easy",
        count: 25,
      }).success,
    ).toBe(false);
  });
});

describe("generateExamRequestSchema", () => {
  it("accepts valid request", () => {
    expect(
      generateExamRequestSchema.safeParse({
        subject: "informatics",
        topics: ["Sorting algorithms", "Big-O notation"],
        country: "US",
        totalPoints: 100,
      }).success,
    ).toBe(true);
  });

  it("rejects totalPoints < 10", () => {
    expect(
      generateExamRequestSchema.safeParse({
        subject: "math",
        topics: ["Derivatives"],
        country: "FR",
        totalPoints: 5,
      }).success,
    ).toBe(false);
  });

  it("rejects empty topics array", () => {
    expect(
      generateExamRequestSchema.safeParse({
        subject: "physics",
        topics: [],
        country: "US",
        totalPoints: 100,
      }).success,
    ).toBe(false);
  });
});

describe("examSchema — 60/20/20 distribution validator", () => {
  const minSolution = {
    restatement: "test",
    assumptions: [],
    steps: [{ title: "s", expression: "x", explanation: "because" }],
    finalAnswer: "42",
  };

  const dummySubpart = { letter: "a", type: "direct" as const, question: "Q?", points: 1, solution: minSolution };
  const dummyExercise = { title: "Exercice", totalPoints: 1, context: "Context.", parts: [{ number: "1", subparts: [dummySubpart] }] };

  function makeExam(
    subpartDefs: Array<{ type: "direct" | "indirect" | "synthesis"; points: number }>,
  ) {
    const subparts = subpartDefs.map((d, i) => ({
      letter: String.fromCharCode(97 + i),
      type: d.type,
      question: "Question text",
      points: d.points,
      solution: minSolution,
    }));
    const exercisePts = subpartDefs.reduce((s, d) => s + d.points, 0);
    return {
      title: "Test Exam",
      durationMinutes: 60,
      totalPoints: exercisePts + 3,  // 3 dummy exercises × 1 pt
      exercises: [
        { title: "Exercice 01", totalPoints: exercisePts, context: "Soit (u_n) une suite.", parts: [{ number: "1", subparts }] },
        dummyExercise,
        dummyExercise,
        dummyExercise,
      ],
    };
  }

  it("accepts a valid 60/20/20 exam (subpart types)", () => {
    const exam = makeExam([
      { type: "direct", points: 3 },
      { type: "direct", points: 3 },
      { type: "indirect", points: 2 },
      { type: "synthesis", points: 2 },
    ]);
    expect(examSchema.safeParse(exam).success).toBe(true);
  });

  it("rejects exam with no exercises", () => {
    expect(
      examSchema.safeParse({
        title: "Empty",
        totalPoints: 100,
        exercises: [],
      }).success,
    ).toBe(false);
  });
});

describe("bookMetaSchema", () => {
  it("accepts a valid pending book", () => {
    expect(
      bookMetaSchema.safeParse({
        title: "Transmath Terminale",
        subject: "math",
        country: "FR",
        storagePath: "books/abc123/original.pdf",
        uploadedBy: "uid123",
        status: "pending",
      }).success,
    ).toBe(true);
  });

  it("rejects an invalid status", () => {
    expect(
      bookMetaSchema.safeParse({
        title: "Book",
        subject: "physics",
        country: "US",
        storagePath: "books/x/original.pdf",
        uploadedBy: "uid",
        status: "deleted",
      }).success,
    ).toBe(false);
  });
});

describe("userProfileSchema", () => {
  it("accepts student role", () => {
    expect(
      userProfileSchema.safeParse({ role: "student" }).success,
    ).toBe(true);
  });

  it("accepts professor role with optional fields", () => {
    expect(
      userProfileSchema.safeParse({
        role: "professor",
        defaultCountry: "FR",
        preferredLanguage: "fr",
      }).success,
    ).toBe(true);
  });

  it("rejects invalid role", () => {
    expect(
      userProfileSchema.safeParse({ role: "admin" }).success,
    ).toBe(false);
  });
});
