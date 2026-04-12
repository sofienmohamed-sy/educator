import { describe, expect, it } from "vitest";
import { buildSystemPrompt } from "../prompts";

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
    expect(prompt).toContain("JP math curriculum");
    expect(prompt).toContain("高校2年");
  });

  it("mandates between-step explanations", () => {
    const prompt = buildSystemPrompt({ country: "US" });
    expect(prompt.toLowerCase()).toContain("passage between");
  });
});
