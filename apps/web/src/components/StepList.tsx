import { useState } from "react";
import MathRenderer from "./MathRenderer";
import FunctionGraph from "./FunctionGraph";
import { renderRichText, looksLikeProse } from "../lib/renderRichText";
import type { GraphSpec } from "../lib/types";

export interface SolutionStep {
  title: string;
  expression: string;
  explanation: string;
  ruleOrTheorem?: string;
}

export interface Solution {
  restatement: string;
  assumptions?: string[];
  steps: SolutionStep[];
  finalAnswer: string;
  verification?: string;
  graphs?: GraphSpec[];
}

interface Props {
  solution: Solution;
}

/**
 * Render a step expression. The expression is supposed to be pure LaTeX, but
 * Claude occasionally includes surrounding prose. When prose is detected we
 * fall back to renderRichText so accented characters aren't garbled by KaTeX.
 */
function renderExpression(expr: string) {
  if (!expr) return null;
  // Already has explicit delimiters — let renderRichText dispatch
  if (/\\\[|\\\(|\$/.test(expr)) return renderRichText(expr);
  // Prose mixed in → don't feed through KaTeX
  if (looksLikeProse(expr))
    return <span style={{ whiteSpace: "pre-wrap", fontStyle: "italic" }}>{renderRichText(expr)}</span>;
  // Pure LaTeX expression
  return <MathRenderer tex={expr} displayMode />;
}

/**
 * Render the final answer. Claude usually outputs LaTeX but may output a
 * prose conclusion ("Il n'existe aucune valeur…"). Prose must NOT go through
 * KaTeX — it garbles accented characters.
 */
function renderFinalAnswer(answer: string) {
  if (!answer) return null;
  if (looksLikeProse(answer)) return <p style={{ margin: 0 }}>{renderRichText(answer)}</p>;
  // If it has delimiters, dispatch via renderRichText
  if (/\\\[|\\\(|\$/.test(answer)) return <>{renderRichText(answer)}</>;
  // Pure LaTeX
  return <MathRenderer tex={answer} displayMode />;
}

export default function StepList({ solution }: Props) {
  const [showExplanations, setShowExplanations] = useState(true);

  return (
    <div>
      <div className="card">
        <p style={{ margin: 0, fontStyle: "italic" }}>{renderRichText(solution.restatement)}</p>
        {solution.assumptions && solution.assumptions.length > 0 && (
          <ul style={{ marginTop: "0.5rem", marginBottom: 0 }}>
            {solution.assumptions.map((a, i) => (
              <li key={i} className="muted">{renderRichText(a)}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="card">
        <div className="row" style={{ justifyContent: "space-between", marginBottom: "0.75rem" }}>
          <span style={{ fontWeight: 600 }}>Solution</span>
          <label style={{ flex: "0 0 auto", margin: 0, fontSize: "0.85rem" }}>
            <input
              type="checkbox"
              checked={showExplanations}
              onChange={(e) => setShowExplanations(e.target.checked)}
              style={{ width: "auto", marginRight: "0.4rem" }}
            />
            Commentaires
          </label>
        </div>

        <div style={{ lineHeight: 1.7 }}>
          {solution.steps.map((s, i) => (
            <div key={i} style={{ marginBottom: "0.75rem" }}>
              {renderExpression(s.expression)}
              {showExplanations && (
                <p style={{ margin: "0.2rem 0 0", color: "var(--text-muted, #555)", fontSize: "0.9rem" }}>
                  {renderRichText(s.explanation)}
                  {s.ruleOrTheorem && (
                    <em style={{ marginLeft: "0.4rem", color: "var(--accent, #7c3aed)" }}>
                      ({s.ruleOrTheorem})
                    </em>
                  )}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {solution.graphs && solution.graphs.length > 0 && (
        <div className="card">
          <span style={{ fontWeight: 600 }}>Représentation graphique</span>
          <div style={{ marginTop: "0.75rem", display: "flex", flexWrap: "wrap", gap: "1rem" }}>
            {solution.graphs.map((g, i) => (
              <FunctionGraph key={i} spec={g} />
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <span style={{ fontWeight: 600 }}>Réponse</span>
        <div style={{ marginTop: "0.4rem" }}>
          {renderFinalAnswer(solution.finalAnswer)}
        </div>
        {solution.verification && (
          <p className="muted" style={{ marginTop: "0.5rem", fontSize: "0.85rem" }}>
            Vérification : {renderRichText(solution.verification)}
          </p>
        )}
      </div>
    </div>
  );
}
