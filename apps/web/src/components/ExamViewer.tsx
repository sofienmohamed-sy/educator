import { useState } from "react";
import FunctionGraph from "./FunctionGraph";
import StepList from "./StepList";
import { renderMarkdown } from "../lib/renderRichText";
import type { Exam, ExamSubpart } from "../lib/types";

const TYPE_LABELS: Record<ExamSubpart["type"], string> = {
  direct: "Direct",
  indirect: "Indirect",
  synthesis: "Synthesis",
};

const TYPE_COLORS: Record<ExamSubpart["type"], string> = {
  direct: "#2563eb",
  indirect: "#d97706",
  synthesis: "#7c3aed",
};

interface Props {
  exam: Exam;
  showRubric?: boolean;
}

export default function ExamViewer({ exam, showRubric = false }: Props) {
  const [answerKeyOpen, setAnswerKeyOpen] = useState(false);

  const allSubparts = exam.exercises.flatMap((e) => e.parts.flatMap((p) => p.subparts));
  const directPts = allSubparts.filter((sp) => sp.type === "direct").reduce((s, sp) => s + sp.points, 0);
  const indirectPts = allSubparts.filter((sp) => sp.type === "indirect").reduce((s, sp) => s + sp.points, 0);
  const synthPts = allSubparts.filter((sp) => sp.type === "synthesis").reduce((s, sp) => s + sp.points, 0);

  return (
    <div>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>{exam.title}</h2>
        <div className="row" style={{ gap: "1.5rem", flexWrap: "wrap" }}>
          <span>
            <strong>Total:</strong> {exam.totalPoints} pts
          </span>
          {exam.durationMinutes && (
            <span>
              <strong>Duration:</strong> {exam.durationMinutes} min
            </span>
          )}
          <span>
            <strong>Exercises:</strong> {exam.exercises.length}
          </span>
        </div>
        <div className="row" style={{ gap: "1rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
          <span style={{ color: TYPE_COLORS.direct, fontSize: "0.85rem" }}>
            Direct helpers: {directPts} pts ({Math.round((directPts / exam.totalPoints) * 100)}%)
          </span>
          <span style={{ color: TYPE_COLORS.indirect, fontSize: "0.85rem" }}>
            Indirect helpers: {indirectPts} pts ({Math.round((indirectPts / exam.totalPoints) * 100)}%)
          </span>
          <span style={{ color: TYPE_COLORS.synthesis, fontSize: "0.85rem" }}>
            Objectives: {synthPts} pts ({Math.round((synthPts / exam.totalPoints) * 100)}%)
          </span>
        </div>
      </div>

      {exam.exercises.map((exercise, ei) => (
        <div key={ei} className="card" style={{ marginBottom: "0.75rem" }}>
          <div className="row" style={{ justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <span style={{ fontWeight: 600 }}>{exercise.title}</span>
            <span style={{ fontWeight: 700 }}>{exercise.totalPoints} pts</span>
          </div>

          <div style={{ marginBottom: "0.75rem", fontStyle: "italic" }}>
            {renderMarkdown(exercise.context)}
          </div>
          {exercise.graphs?.map((g, gi) => (
            <FunctionGraph key={gi} spec={g} />
          ))}

          {exercise.parts.map((part) => (
            <div key={part.number} style={{ marginBottom: "0.5rem" }}>
              <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                {part.number})
              </div>
              {part.subparts.map((subpart) => (
                <div
                  key={subpart.letter}
                  className="row"
                  style={{ gap: "0.5rem", alignItems: "flex-start", marginBottom: "0.25rem", paddingLeft: "1rem" }}
                >
                  <span style={{ fontWeight: 500, minWidth: "1.25rem" }}>{subpart.letter})</span>
                  <span style={{ flex: 1 }}>{renderMarkdown(subpart.question)}</span>
                  <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>{subpart.points} pts</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}

      <div style={{ textAlign: "center", margin: "1rem 0" }}>
        <button
          type="button"
          className={answerKeyOpen ? "primary" : ""}
          onClick={() => setAnswerKeyOpen((v) => !v)}
        >
          {answerKeyOpen ? "Hide answer key" : "Show answer key"}
        </button>
      </div>

      {answerKeyOpen && (
        <div>
          <h3>Answer Key</h3>
          {exam.exercises.map((exercise, ei) => (
            <div key={ei} style={{ marginBottom: "2rem" }}>
              <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>
                {exercise.title} — {exercise.totalPoints} pts
              </div>
              <div className="muted" style={{ marginBottom: "0.5rem", fontStyle: "italic" }}>
                {renderMarkdown(exercise.context)}
              </div>
              {exercise.parts.map((part) => (
                <div key={part.number} style={{ marginBottom: "1rem" }}>
                  <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>{part.number})</div>
                  {part.subparts.map((subpart) => (
                    <div key={subpart.letter} style={{ marginBottom: "1rem", paddingLeft: "1rem" }}>
                      <div className="row" style={{ gap: "0.5rem", marginBottom: "0.25rem" }}>
                        <span style={{ fontWeight: 500 }}>{subpart.letter})</span>
                        <span
                          style={{
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            color: TYPE_COLORS[subpart.type],
                          }}
                        >
                          [{TYPE_LABELS[subpart.type]}]
                        </span>
                        <span style={{ flex: 1 }}>{renderMarkdown(subpart.question)}</span>
                        <span style={{ fontWeight: 700 }}>{subpart.points} pts</span>
                      </div>
                      <StepList solution={subpart.solution} />
                      {showRubric && subpart.rubric && (
                        <div
                          className="card"
                          style={{ background: "var(--bg-alt, #fef9c3)", marginTop: "0.5rem" }}
                        >
                          <strong>Grading rubric:</strong> {renderMarkdown(subpart.rubric!)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
