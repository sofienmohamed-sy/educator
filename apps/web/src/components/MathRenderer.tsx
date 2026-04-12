import { useMemo } from "react";
import katex from "katex";

interface Props {
  tex: string;
  displayMode?: boolean;
}

/** Render a LaTeX expression with KaTeX. Falls back to raw text on error. */
export default function MathRenderer({ tex, displayMode = false }: Props) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(tex, {
        displayMode,
        throwOnError: false,
        output: "html",
      });
    } catch {
      return null;
    }
  }, [tex, displayMode]);

  if (!html) return <code>{tex}</code>;
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}
