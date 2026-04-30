import type { ReactNode } from "react";
import MathRenderer from "../components/MathRenderer";

// Splits text on display/inline math delimiters and **bold**
// Order matters: longer/greedier patterns first
const RICH_PATTERN =
  /(\\\[[\s\S]+?\\\]|\$\$[\s\S]+?\$\$|\\\([\s\S]+?\\\)|\$[^$\n]+\$|\*\*[^*]+\*\*)/g;

/**
 * Renders a mixed string containing LaTeX (\(...\), $...$, \[...\], $$...$$)
 * and Markdown bold (**text**) into React nodes.
 */
export function renderRichText(text: string): ReactNode {
  if (!text) return null;
  const parts = text.split(RICH_PATTERN);
  return parts.map((part, i) => {
    const displayBracket = part.match(/^\\\[([\s\S]+)\\\]$/u);
    if (displayBracket) return <MathRenderer key={i} tex={displayBracket[1]} displayMode />;

    const displayDollar = part.match(/^\$\$([\s\S]+)\$\$$/u);
    if (displayDollar) return <MathRenderer key={i} tex={displayDollar[1]} displayMode />;

    const inlineParens = part.match(/^\\\(([\s\S]+)\\\)$/u);
    if (inlineParens) return <MathRenderer key={i} tex={inlineParens[1]} />;

    const inlineDollar = part.match(/^\$([^$\n]+)\$$/u);
    if (inlineDollar) return <MathRenderer key={i} tex={inlineDollar[1]} />;

    const bold = part.match(/^\*\*([^*]+)\*\*$/u);
    if (bold) return <strong key={i}>{bold[1]}</strong>;

    return <span key={i}>{part}</span>;
  });
}

/**
 * Returns true when a string looks like natural-language prose rather than
 * a pure LaTeX expression. Used to decide whether to pass content through
 * KaTeX or render it as rich text (preventing garbled accented characters).
 *
 * Signals detected:
 *  - Ends with sentence-final punctuation (.!?)
 *  - Contains " : " (narrative colon used in French explanations)
 *  - Contains an unescaped apostrophe (French contractions: n', l', d'…)
 *  - Starts with a capitalised prose word ("Il ", "On ", "Donc "…)
 */
export function looksLikeProse(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (/[.!?]$/.test(t)) return true;
  if (/\s:\s/.test(t)) return true;
  if (/(?<!\\)'/.test(t)) return true;
  if (/^[A-ZÀ-Ÿ][a-zà-ÿ]{2,}\s/.test(t)) return true;
  return false;
}

/**
 * Collapses multi-line display-math blocks (\[...\] and $$...$$) into a
 * single line so renderMarkdown's line-by-line scanner can match them.
 * Internal newlines are replaced with a space; KaTeX ignores whitespace.
 */
function normalizeDisplayMath(text: string): string {
  return text
    .replace(/\\\[([\s\S]+?)\\\]/g, (_, inner) => `\\[${inner.replace(/\n/g, " ")}\\]`)
    .replace(/\$\$([\s\S]+?)\$\$/g, (_, inner) => `$$${inner.replace(/\n/g, " ")}$$`);
}

/**
 * Renders a Markdown-ish string with block structure:
 * - ### / ## / # headings
 * - - bullet lists
 * - Blank lines → paragraph breaks
 * - Single newlines → <br />
 * Within each block, renderRichText handles inline math and bold.
 */
export function renderMarkdown(text: string): ReactNode {
  if (!text) return null;

  // Collapse multi-line display math before any further splitting
  const normalized = normalizeDisplayMath(text);

  // Split into paragraphs on blank lines
  const paragraphs = normalized.split(/\n{2,}/);
  const nodes: ReactNode[] = [];

  for (let pi = 0; pi < paragraphs.length; pi++) {
    const para = paragraphs[pi].trim();
    if (!para) continue;

    const lines = para.split("\n");

    // Théorème / Retenons box: all lines start with ">"
    // Rendered with a yellow left-border box (like the fiche's coloured theorem boxes)
    const allBlockquotes = lines.every((l) => /^>\s*/.test(l.trim()) || l.trim() === "");
    if (allBlockquotes && lines.some((l) => /^>\s*/.test(l.trim()))) {
      nodes.push(
        <div
          key={pi}
          style={{
            background: "var(--bg-yellow, #fffde7)",
            borderLeft: "4px solid var(--accent-yellow, #d97706)",
            border: "1px solid var(--border-yellow, #fde68a)",
            borderRadius: "0 4px 4px 0",
            padding: "0.6rem 1rem",
            margin: "0.6rem 0",
            lineHeight: 1.7,
          }}
        >
          {lines.map((l, li) => {
            const content = l.trim().replace(/^>\s*/, "");
            if (!content) return <br key={li} />;
            return <div key={li}>{renderRichText(content)}</div>;
          })}
        </div>,
      );
      continue;
    }

    // Check if this paragraph is a bullet list
    const allBullets = lines.every((l) => /^[-*] /.test(l.trim()));
    if (allBullets) {
      nodes.push(
        <ul key={pi} style={{ marginTop: "0.5rem", marginBottom: "0.5rem", paddingLeft: "1.5rem" }}>
          {lines.map((l, li) => (
            <li key={li}>{renderRichText(l.trim().replace(/^[-*] /, ""))}</li>
          ))}
        </ul>,
      );
      continue;
    }

    // Mixed block: render line by line
    const lineNodes: ReactNode[] = [];
    for (let li = 0; li < lines.length; li++) {
      const line = lines[li];
      const trimmed = line.trim();

      const h3 = trimmed.match(/^### (.+)/);
      if (h3) {
        lineNodes.push(<h3 key={li} style={{ margin: "0.75rem 0 0.25rem" }}>{renderRichText(h3[1])}</h3>);
        continue;
      }
      const h2 = trimmed.match(/^## (.+)/);
      if (h2) {
        lineNodes.push(<h2 key={li} style={{ margin: "0.75rem 0 0.25rem" }}>{renderRichText(h2[1])}</h2>);
        continue;
      }
      const h1 = trimmed.match(/^# (.+)/);
      if (h1) {
        lineNodes.push(<h1 key={li} style={{ margin: "0.75rem 0 0.25rem" }}>{renderRichText(h1[1])}</h1>);
        continue;
      }
      const bullet = trimmed.match(/^[-*] (.+)/);
      if (bullet) {
        lineNodes.push(
          <ul key={li} style={{ margin: "0.1rem 0", paddingLeft: "1.5rem" }}>
            <li>{renderRichText(bullet[1])}</li>
          </ul>,
        );
        continue;
      }

      if (trimmed === "") {
        lineNodes.push(<br key={li} />);
        continue;
      }

      lineNodes.push(
        <span key={li}>
          {renderRichText(trimmed)}
          {li < lines.length - 1 && <br />}
        </span>,
      );
    }

    nodes.push(<p key={pi} style={{ margin: "0.5rem 0", lineHeight: 1.7 }}>{lineNodes}</p>);
  }

  return <>{nodes}</>;
}
