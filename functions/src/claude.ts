import Anthropic from "@anthropic-ai/sdk";
import { logger } from "firebase-functions/v2";
import type { ZodType, ZodTypeDef } from "zod";
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

export interface MultimodalInput {
  kind: "text" | "storage";
  text?: string;
  fileBytes?: Buffer;
  fileContentType?: string;
}

export interface MultimodalUserInstructions {
  forText: (text: string) => string;
  forImage: string;
  forPdf: string;
}

const DEFAULT_MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 4096;
const MAX_TOKENS_GENERATION = 8192;

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
 * Generic: send a text prompt to Claude and parse the JSON response against
 * any Zod schema. Retries once with a corrective nudge on validation failure.
 */
export async function generateWithClaude<T>(args: {
  apiKey: string;
  model?: string;
  systemPrompt: string;
  userMessage: string;
  schema: ZodType<T, ZodTypeDef, unknown>;
  maxTokens?: number;
}): Promise<T> {
  const { apiKey, systemPrompt, userMessage, schema } = args;
  const model = args.model ?? DEFAULT_MODEL;
  const maxTokens = args.maxTokens ?? MAX_TOKENS_GENERATION;
  const anthropic = client(apiKey);

  const userContent: Anthropic.Messages.ContentBlockParam[] = [
    { type: "text", text: userMessage },
  ];

  const firstReply = await callClaude(anthropic, model, systemPrompt, userContent, maxTokens);
  const firstParse = tryParseAs(firstReply, schema);
  if (firstParse.ok) return firstParse.value;

  logger.warn("Claude response failed validation; retrying once", {
    error: firstParse.error,
  });

  const retryContent: Anthropic.Messages.ContentBlockParam[] = [
    ...userContent,
    {
      type: "text",
      text: `Your previous response could not be parsed as the required JSON. Error:\n${firstParse.error}\n\nReturn ONLY a valid JSON object matching the schema in the system prompt.`,
    },
  ];
  const secondReply = await callClaude(anthropic, model, systemPrompt, retryContent, maxTokens);
  const secondParse = tryParseAs(secondReply, schema);
  if (secondParse.ok) return secondParse.value;

  throw new Error(
    `Claude returned invalid JSON after retry: ${secondParse.error}`,
  );
}

/**
 * Streaming variant of generateWithClaude. Calls `onDelta` for each text
 * token as it arrives, then returns the fully parsed result at the end.
 */
export async function streamWithClaude<T>(args: {
  apiKey: string;
  model?: string;
  systemPrompt: string;
  userMessage: string;
  schema: ZodType<T, ZodTypeDef, unknown>;
  onDelta: (text: string) => void;
}): Promise<T> {
  const { apiKey, systemPrompt, userMessage, schema, onDelta } = args;
  const model = args.model ?? DEFAULT_MODEL;
  const anthropic = client(apiKey);

  let fullText = "";

  const stream = anthropic.messages.stream({
    model,
    max_tokens: MAX_TOKENS_GENERATION,
    system: [{ type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: [{ type: "text", text: userMessage }] }],
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      fullText += event.delta.text;
      onDelta(event.delta.text);
    }
  }

  const result = tryParseAs(fullText, schema);
  if (result.ok) return result.value;
  throw new Error(`Claude returned invalid JSON: ${result.error}`);
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
  const firstParse = tryParseAs(firstReply, solutionSchema);
  if (firstParse.ok) return firstParse.value;

  logger.warn("Claude solution failed validation; retrying once", {
    error: firstParse.error,
  });

  const retryContent: Anthropic.Messages.ContentBlockParam[] = [
    ...userContent,
    {
      type: "text",
      text: `Your previous response could not be parsed as the required JSON. Error:\n${firstParse.error}\n\nReturn ONLY a valid JSON object matching the schema in the system prompt.`,
    },
  ];
  const secondReply = await callClaude(anthropic, model, systemPrompt, retryContent);
  const secondParse = tryParseAs(secondReply, solutionSchema);
  if (secondParse.ok) return secondParse.value;

  throw new Error(
    `Claude returned an invalid solution after retry: ${secondParse.error}`,
  );
}

export interface AnalyzeArgs<T> {
  apiKey: string;
  model?: string;
  systemPrompt: string;
  input: SolveRequest["input"];
  fileBytes?: Buffer;
  fileContentType?: string;
  schema: ZodType<T, ZodTypeDef, unknown>;
  instructions: MultimodalUserInstructions;
}

/**
 * Generic multimodal Claude call — like `solveWithClaude` but accepts any
 * schema and custom user instruction strings. Used by the writing solver.
 */
export async function analyzeWithClaude<T>(args: AnalyzeArgs<T>): Promise<T> {
  const { apiKey, systemPrompt, input, schema, instructions } = args;
  const model = args.model ?? DEFAULT_MODEL;
  const anthropic = client(apiKey);

  const userContent = buildUserContent(
    input,
    args.fileBytes,
    args.fileContentType,
    instructions,
  );

  const firstReply = await callClaude(anthropic, model, systemPrompt, userContent, MAX_TOKENS_GENERATION);
  const firstParse = tryParseAs(firstReply, schema);
  if (firstParse.ok) return firstParse.value;

  logger.warn("Claude analysis failed validation; retrying once", {
    error: firstParse.error,
  });

  const retryContent: Anthropic.Messages.ContentBlockParam[] = [
    ...userContent,
    {
      type: "text",
      text: `Your previous response could not be parsed as the required JSON. Error:\n${firstParse.error}\n\nReturn ONLY a valid JSON object matching the schema in the system prompt.`,
    },
  ];
  const secondReply = await callClaude(anthropic, model, systemPrompt, retryContent, MAX_TOKENS_GENERATION);
  const secondParse = tryParseAs(secondReply, schema);
  if (secondParse.ok) return secondParse.value;

  throw new Error(
    `Claude returned invalid JSON after retry: ${secondParse.error}`,
  );
}

async function callClaude(
  anthropic: Anthropic,
  model: string,
  systemPrompt: string,
  userContent: Anthropic.Messages.ContentBlockParam[],
  maxTokens: number = MAX_TOKENS,
): Promise<string> {
  const response = await anthropic.messages.create({
    model,
    max_tokens: maxTokens,
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

const DEFAULT_INSTRUCTIONS: MultimodalUserInstructions = {
  forText: USER_INSTRUCTION_FOR_TEXT,
  forImage: USER_INSTRUCTION_FOR_IMAGE,
  forPdf: USER_INSTRUCTION_FOR_PDF,
};

function buildUserContent(
  input: SolveRequest["input"],
  fileBytes: Buffer | undefined,
  fileContentType: string | undefined,
  instructions: MultimodalUserInstructions = DEFAULT_INSTRUCTIONS,
): Anthropic.Messages.ContentBlockParam[] {
  if (input.kind === "text") {
    return [{ type: "text", text: instructions.forText(input.text) }];
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
      { type: "text", text: instructions.forPdf },
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
    { type: "text", text: instructions.forImage },
  ];
}

type ParseResult<T> = { ok: true; value: T } | { ok: false; error: string };

/** Extract the first JSON object from Claude's reply and validate it against any Zod schema. */
function tryParseAs<T>(text: string, schema: ZodType<T, ZodTypeDef, unknown>): ParseResult<T> {
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

  const result = schema.safeParse(parsed);
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
