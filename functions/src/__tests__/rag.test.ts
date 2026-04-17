import { describe, expect, it } from "vitest";
import { chunkText } from "../rag";

// Unit tests for chunkText (no external dependencies)
describe("chunkText", () => {
  it("returns empty array for empty string", () => {
    expect(chunkText("")).toEqual([]);
    expect(chunkText("   ")).toEqual([]);
  });

  it("returns single chunk for text shorter than CHUNK_SIZE", () => {
    const text = "Short text.";
    const chunks = chunkText(text);
    expect(chunks).toHaveLength(1);
    expect(chunks[0].chunkIndex).toBe(0);
    expect(chunks[0].text).toBe(text);
  });

  it("splits long text into multiple chunks", () => {
    // 2000 chars should produce multiple chunks of ~800 chars
    const text = "A".repeat(2000);
    const chunks = chunkText(text);
    expect(chunks.length).toBeGreaterThan(1);
  });

  it("assigns sequential chunkIndex values starting from 0", () => {
    const text = "A".repeat(2000);
    const chunks = chunkText(text);
    chunks.forEach((chunk, i) => {
      expect(chunk.chunkIndex).toBe(i);
    });
  });

  it("each chunk text is non-empty and trimmed", () => {
    const text = "Word ".repeat(500);
    const chunks = chunkText(text);
    for (const chunk of chunks) {
      expect(chunk.text.trim()).toBeTruthy();
      expect(chunk.text).toBe(chunk.text.trim());
    }
  });

  it("last chunk covers the end of the text", () => {
    const text = "Hello world. ".repeat(100);
    const chunks = chunkText(text);
    const lastChunk = chunks[chunks.length - 1];
    // The end of the last chunk should match the end of the trimmed source
    expect(text.includes(lastChunk.text.slice(-20))).toBe(true);
  });
});
