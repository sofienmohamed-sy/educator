import type { ReactNode } from "react";
import MathRenderer from "../components/MathRenderer";

// Splits text on \(...\), $...$, and **...** markers
const RICH_PATTERN = /(\\\([\s\S]+?\\\)|\$[^$\n]+\$|\*\*[^*]+\*\*)/g;

/**
 * Renders a mixed string containing inline LaTeX (\(...\) or $...$)
 * and Markdown bold (**text**) into React nodes.
 */
export function renderRichText(text: string): ReactNode {
  if (!text) return null;
  const parts = text.split(RICH_PATTERN);
  return parts.map((part, i) => {
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
 * Renders a Markdown-ish string with block structure:
 * - ### / ## / # headings
 * - - bullet lists
 * - Blank lines → paragraph breaks
 * - Single newlines → <br />
 * Within each block, renderRichText handles inline math and bold.
 */
export function renderMarkdown(text: string): ReactNode {
  if (!text) return null;

  // Split into paragraphs on blank lines
  const paragraphs = text.split(/\n{2,}/);
  const nodes: ReactNode[] = [];

  for (let pi = 0; pi < paragraphs.length; pi++) {
    const para = paragraphs[pi].trim();
    if (!para) continue;

    const lines = para.split("\n");

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
