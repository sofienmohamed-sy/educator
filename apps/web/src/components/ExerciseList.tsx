import { useState } from "react";
import StepList from "./StepList";
import type { Exercise } from "../lib/types";

interface Props {
  exercises: Exercise[];
}

export default function ExerciseList({ exercises }: Props) {
  const [hintsOpen, setHintsOpen] = useState<Set<number>>(new Set());
  const [solutionOpen, setSolutionOpen] = useState<Set<number>>(new Set());

  function toggleHints(i: number) {
    setHintsOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  function toggleSolution(i: number) {
    setSolutionOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  return (
    <div>
      {exercises.map((ex, i) => (
        <div key={i} className="card" style={{ marginBottom: "1rem" }}>
          <h4 style={{ marginTop: 0 }}>
            Exercise {i + 1}
          </h4>
          <p>{ex.question}</p>

          {ex.hints && ex.hints.length > 0 && (
            <div style={{ marginBottom: "0.5rem" }}>
              <button
                type="button"
                onClick={() => toggleHints(i)}
                style={{ fontSize: "0.85rem" }}
              >
                {hintsOpen.has(i) ? "Hide hints" : "Show hints"}
              </button>
              {hintsOpen.has(i) && (
                <ol style={{ marginTop: "0.5rem" }}>
                  {ex.hints.map((hint, j) => (
                    <li key={j}>{hint}</li>
                  ))}
                </ol>
              )}
            </div>
          )}

          <button
            type="button"
            className={solutionOpen.has(i) ? "primary" : ""}
            onClick={() => toggleSolution(i)}
            style={{ fontSize: "0.85rem" }}
          >
            {solutionOpen.has(i) ? "Hide solution" : "Show solution"}
          </button>

          {solutionOpen.has(i) && (
            <div style={{ marginTop: "1rem" }}>
              <StepList solution={ex.solution} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
