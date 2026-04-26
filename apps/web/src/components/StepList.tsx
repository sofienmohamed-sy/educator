import { useState } from "react";
import MathRenderer from "./MathRenderer";
import { renderRichText } from "../lib/renderRichText";

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
}

interface Props {
  solution: Solution;
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
              <MathRenderer tex={s.expression} displayMode />
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

      <div className="card">
        <span style={{ fontWeight: 600 }}>Réponse</span>
        <div style={{ marginTop: "0.4rem" }}>
          <MathRenderer tex={solution.finalAnswer} displayMode />
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
