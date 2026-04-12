import { describe, expect, it } from "vitest";
import { solveRequestSchema, solutionSchema } from "../schema";

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
