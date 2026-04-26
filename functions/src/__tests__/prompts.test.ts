import { describe, expect, it } from "vitest";
import {
  buildSystemPrompt,
  buildRagContextBlock,
  buildCoursePrompt,
  buildExercisesPrompt,
  buildExamPrompt,
} from "../prompts";

describe("buildSystemPrompt", () => {
  it("injects the curriculum profile when one is provided", () => {
    const prompt = buildSystemPrompt({
      country: "FR",
      profile: {
        countryCode: "FR",
        countryName: "France",
        defaultLanguage: "fr",
        notation: "Use ; as list separator",
        conventions: "Prefer fractions over decimals",
        referenceBooks: ["Transmath Terminale"],
      },
    });
    expect(prompt).toContain("France");
    expect(prompt).toContain("Transmath Terminale");
    expect(prompt).toContain("Prefer fractions");
    // Must still contain the JSON contract.
    expect(prompt).toContain("type Solution =");
  });

  it("falls back to Claude's knowledge when no profile is provided", () => {
    const prompt = buildSystemPrompt({ country: "JP", gradeLevel: "高校2年" });
    expect(prompt).toContain("JP mathematics curriculum");
    expect(prompt).toContain("高校2年");
  });

  it("mandates between-step explanations", () => {
    const prompt = buildSystemPrompt({ country: "US" });
    expect(prompt.toLowerCase()).toContain("passage between");
  });

  it("includes subject label when subject is provided", () => {
    const prompt = buildSystemPrompt({ country: "US", subject: "physics" });
    expect(prompt).toContain("physics tutor");
  });

  it("injects ragContext when provided", () => {
    const prompt = buildSystemPrompt({
      country: "FR",
      ragContext: "REFERENCE MATERIAL\n\n[Excerpt 1]\nSome book text",
    });
    expect(prompt).toContain("REFERENCE MATERIAL");
    expect(prompt).toContain("Excerpt 1");
  });
});

describe("buildRagContextBlock", () => {
  it("returns empty string for empty chunks array", () => {
    expect(buildRagContextBlock([])).toBe("");
  });

  it("numbers excerpts correctly", () => {
    const block = buildRagContextBlock([
      { text: "First chunk", bookTitle: "Book A" },
      { text: "Second chunk", bookTitle: "Book B", pageHint: 42 },
    ]);
    expect(block).toContain("[Excerpt 1 — Book A]");
    expect(block).toContain("[Excerpt 2");
    expect(block).toContain("p.42");
    expect(block).toContain("REFERENCE MATERIAL");
  });

  it("adds STYLE GUIDE and STYLE MANDATE when style chunks are provided", () => {
    const block = buildRagContextBlock(
      [{ text: "Content chunk", bookTitle: "Book A" }],
      [{ text: "Opening chapter text", bookTitle: "Book A" }],
    );
    expect(block).toContain("STYLE GUIDE");
    expect(block).toContain("STYLE MANDATE");
    expect(block).toContain("Style Sample 1");
    expect(block).toContain("CONTENT REFERENCE");
    expect(block).toContain("Excerpt 1");
  });

  it("returns empty string when both arrays are empty", () => {
    expect(buildRagContextBlock([], [])).toBe("");
  });
});

describe("buildCoursePrompt", () => {
  it("includes topic and subject", () => {
    const prompt = buildCoursePrompt({
      subject: "chemistry",
      topic: "Acid-base reactions",
      country: "US",
    });
    expect(prompt).toContain("Acid-base reactions");
    expect(prompt).toContain("chemistry");
    expect(COURSE_CONTRACT_MARKER.test(prompt)).toBe(true);
  });

  it("injects RAG context when provided", () => {
    const prompt = buildCoursePrompt({
      subject: "math",
      topic: "Integrals",
      country: "FR",
      ragContext: "REFERENCE MATERIAL\n\n[Excerpt 1]\nIntegral definition",
    });
    expect(prompt).toContain("REFERENCE MATERIAL");
  });
});

describe("buildExercisesPrompt", () => {
  it("includes count and difficulty", () => {
    const prompt = buildExercisesPrompt({
      subject: "physics",
      topic: "Kinematics",
      difficulty: "hard",
      count: 3,
      country: "UK",
    });
    expect(prompt).toContain("3");
    expect(prompt).toContain("hard");
    expect(prompt).toContain("Kinematics");
  });
});

describe("buildExamPrompt", () => {
  it("contains 60/20/20 mandatory distribution language", () => {
    const prompt = buildExamPrompt({
      subject: "math",
      topics: ["Derivatives", "Integrals"],
      totalPoints: 100,
      country: "FR",
    });
    expect(prompt).toContain("60%");
    expect(prompt).toContain("20%");
    expect(prompt).toContain("direct");
    expect(prompt).toContain("indirect");
    expect(prompt).toContain("synthesis");
    expect(prompt).toContain("sum(exercises[i].totalPoints) MUST equal 100");
  });

  it("contains type rules for subparts", () => {
    const prompt = buildExamPrompt({
      subject: "physics",
      topics: ["Mechanics"],
      totalPoints: 50,
      country: "US",
    });
    expect(prompt).toContain("direct");
    expect(prompt).toContain("indirect");
    expect(prompt).toContain("synthesis");
    expect(prompt).toContain("WHAT IS A HELPER");
    expect(prompt).toContain("ORDER RULE");
  });
});

// Helper regex to check course JSON contract marker appears in prompt
const COURSE_CONTRACT_MARKER = /type Course\s*=/u;
