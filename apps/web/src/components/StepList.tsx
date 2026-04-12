import { useState } from "react";
import MathRenderer from "./MathRenderer";

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
        <h3 style={{ marginTop: 0 }}>Problem</h3>
        <p>{solution.restatement}</p>
        {solution.assumptions && solution.assumptions.length > 0 ? (
          <>
            <h4>Assumptions</h4>
            <ul>
              {solution.assumptions.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </>
        ) : null}
      </div>

      <div className="card">
        <div className="row" style={{ justifyContent: "space-between", marginBottom: "0.75rem" }}>
          <h3 style={{ margin: 0 }}>Step-by-step solution</h3>
          <label style={{ flex: "0 0 auto", margin: 0 }}>
            <input
              type="checkbox"
              checked={showExplanations}
              onChange={(e) => setShowExplanations(e.target.checked)}
              style={{ width: "auto", marginRight: "0.4rem" }}
            />
            Show explanations
          </label>
        </div>

        {solution.steps.map((s, i) => (
          <div className="step" key={i}>
            <h3>
              Step {i + 1}: {s.title}
            </h3>
            <div>
              <MathRenderer tex={s.expression} displayMode />
            </div>
            {s.ruleOrTheorem ? (
              <p className="muted" style={{ margin: "0.25rem 0 0" }}>
                <em>Rule / theorem:</em> {s.ruleOrTheorem}
              </p>
            ) : null}
            {showExplanations ? (
              <p className="explanation">
                <strong>Why this follows:</strong> {s.explanation}
              </p>
            ) : null}
          </div>
        ))}
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Final answer</h3>
        <MathRenderer tex={solution.finalAnswer} displayMode />
        {solution.verification ? (
          <p className="muted" style={{ marginTop: "0.75rem" }}>
            <strong>Check:</strong> {solution.verification}
          </p>
        ) : null}
      </div>
    </div>
  );
}
