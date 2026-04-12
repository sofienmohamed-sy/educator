import Anthropic from "@anthropic-ai/sdk";
import { logger } from "firebase-functions/v2";
import {
  solutionSchema,
  type Solution,
  type SolveRequest,
} from "./schema";
import {
  USER_INSTRUCTION_FOR_IMAGE,
  USER_INSTRUCTION_FOR_PDF,
  USER_INSTRUCTION_FOR_TEXT,
} from "./prompts";

const DEFAULT_MODEL = "claude-opus-4-6";
const MAX_TOKENS = 4096;

/** Lazy client — created on first use so unit tests can mock the module. */
let cachedClient: Anthropic | null = null;
function client(apiKey: string): Anthropic {
  if (!cachedClient) {
    cachedClient = new Anthropic({ apiKey });
  }
  return cachedClient;
}

/** For tests. */
export function __resetClientForTests(): void {
  cachedClient = null;
}

export interface SolveArgs {
  apiKey: string;
  model?: SolveRequest["model"];
  systemPrompt: string;
  input: SolveRequest["input"];
  /** For `storage` inputs — the bytes fetched from Firebase Storage. */
  fileBytes?: Buffer;
  fileContentType?: string;
}

/**
 * Send the problem to Claude and parse the returned JSON into a validated
 * `Solution`. Retries once with the zod error appended if the first response
 * fails validation.
 */
export async function solveWithClaude(args: SolveArgs): Promise<Solution> {
  const { apiKey, systemPrompt, input } = args;
  const model = args.model ?? DEFAULT_MODEL;

  const userContent = buildUserContent(input, args.fileBytes, args.fileContentType);

  const anthropic = client(apiKey);

  const firstReply = await callClaude(anthropic, model, systemPrompt, userContent);
  const firstParse = tryParseSolution(firstReply);
  if (firstParse.ok) return firstParse.value;

  logger.warn("Claude solution failed validation; retrying once", {
    error: firstParse.error,
  });

  // Retry with a corrective nudge appended.
  const retryContent: Anthropic.Messages.ContentBlockParam[] = [
    ...userContent,
    {
      type: "text",
      text: `Your previous response could not be parsed as the required JSON. Error:\n${firstParse.error}\n\nReturn ONLY a valid JSON object matching the schema in the system prompt.`,
    },
  ];
  const secondReply = await callClaude(anthropic, model, systemPrompt, retryContent);
  const secondParse = tryParseSolution(secondReply);
  if (secondParse.ok) return secondParse.value;

  throw new Error(
    `Claude returned an invalid solution after retry: ${secondParse.error}`,
  );
}

async function callClaude(
  anthropic: Anthropic,
  model: string,
  systemPrompt: string,
  userContent: Anthropic.Messages.ContentBlockParam[],
): Promise<string> {
  const response = await anthropic.messages.create({
    model,
    max_tokens: MAX_TOKENS,
    // Prompt-cache the static system prompt for repeat callers.
    system: [
      {
        type: "text",
        text: systemPrompt,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userContent }],
  });

  const text = response.content
    .filter((block): block is Anthropic.Messages.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();

  if (!text) throw new Error("Claude returned no text content");
  return text;
}

function buildUserContent(
  input: SolveRequest["input"],
  fileBytes: Buffer | undefined,
  fileContentType: string | undefined,
): Anthropic.Messages.ContentBlockParam[] {
  if (input.kind === "text") {
    return [{ type: "text", text: USER_INSTRUCTION_FOR_TEXT(input.text) }];
  }

  if (!fileBytes || !fileContentType) {
    throw new Error("storage input requires fileBytes + fileContentType");
  }

  const base64 = fileBytes.toString("base64");

  if (fileContentType === "application/pdf") {
    return [
      {
        type: "document",
        source: {
          type: "base64",
          media_type: "application/pdf",
          data: base64,
        },
      },
      { type: "text", text: USER_INSTRUCTION_FOR_PDF },
    ];
  }

  // Image
  return [
    {
      type: "image",
      source: {
        type: "base64",
        media_type:
          fileContentType as Anthropic.Messages.ImageBlockParam["source"]["media_type"],
        data: base64,
      },
    },
    { type: "text", text: USER_INSTRUCTION_FOR_IMAGE },
  ];
}

type ParseResult<T> = { ok: true; value: T } | { ok: false; error: string };

/** Extract the first JSON object from Claude's reply and validate it. */
function tryParseSolution(text: string): ParseResult<Solution> {
  const jsonText = extractJsonObject(text);
  if (!jsonText) return { ok: false, error: "no JSON object found in reply" };

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch (err) {
    return {
      ok: false,
      error: `JSON.parse failed: ${(err as Error).message}`,
    };
  }

  const result = solutionSchema.safeParse(parsed);
  if (!result.success) {
    return {
      ok: false,
      error: result.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; "),
    };
  }
  return { ok: true, value: result.data };
}

/**
 * Claude usually returns pure JSON, but sometimes wraps it in markdown
 * fences. Pull out the first `{...}` block.
 */
function extractJsonObject(text: string): string | null {
  const trimmed = text.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) return trimmed;

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/u);
  if (fenced?.[1]) return fenced[1].trim();

  const first = trimmed.indexOf("{");
  const last = trimmed.lastIndexOf("}");
  if (first !== -1 && last > first) return trimmed.slice(first, last + 1);

  return null;
}
