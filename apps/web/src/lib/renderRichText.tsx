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
