import { useState } from "react";
import StepList from "./StepList";
import type { Exam, ExamQuestion } from "../lib/types";

const TYPE_LABELS: Record<ExamQuestion["type"], string> = {
  direct: "Direct",
  indirect: "Indirect",
  synthesis: "Synthesis",
};

const TYPE_COLORS: Record<ExamQuestion["type"], string> = {
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

  const directPts = exam.questions
    .filter((q) => q.type === "direct")
    .reduce((s, q) => s + q.points, 0);
  const indirectPts = exam.questions
    .filter((q) => q.type === "indirect")
    .reduce((s, q) => s + q.points, 0);
  const synthPts = exam.questions
    .filter((q) => q.type === "synthesis")
    .reduce((s, q) => s + q.points, 0);

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
            <strong>Questions:</strong> {exam.questions.length}
          </span>
        </div>
        <div className="row" style={{ gap: "1rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
          <span style={{ color: TYPE_COLORS.direct, fontSize: "0.85rem" }}>
            Direct: {directPts} pts (
            {Math.round((directPts / exam.totalPoints) * 100)}%)
          </span>
          <span style={{ color: TYPE_COLORS.indirect, fontSize: "0.85rem" }}>
            Indirect: {indirectPts} pts (
            {Math.round((indirectPts / exam.totalPoints) * 100)}%)
          </span>
          <span style={{ color: TYPE_COLORS.synthesis, fontSize: "0.85rem" }}>
            Synthesis: {synthPts} pts (
            {Math.round((synthPts / exam.totalPoints) * 100)}%)
          </span>
        </div>
      </div>

      {exam.questions.map((q, i) => (
        <div key={i} className="card" style={{ marginBottom: "0.75rem" }}>
          <div className="row" style={{ justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <div className="row" style={{ gap: "0.5rem" }}>
              <span style={{ fontWeight: 600 }}>Q{i + 1}</span>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: TYPE_COLORS[q.type],
                  background: `${TYPE_COLORS[q.type]}18`,
                  padding: "2px 8px",
                  borderRadius: "999px",
                }}
              >
                {TYPE_LABELS[q.type]}
              </span>
            </div>
            <span style={{ fontWeight: 700 }}>{q.points} pts</span>
          </div>
          <p style={{ margin: 0 }}>{q.question}</p>
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
          {exam.questions.map((q, i) => (
            <div key={i} style={{ marginBottom: "1.5rem" }}>
              <div className="row" style={{ gap: "0.5rem", marginBottom: "0.5rem" }}>
                <span style={{ fontWeight: 600 }}>Q{i + 1} — {q.points} pts</span>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: TYPE_COLORS[q.type],
                  }}
                >
                  [{TYPE_LABELS[q.type]}]
                </span>
              </div>
              <p className="muted" style={{ marginBottom: "0.5rem" }}>
                {q.question}
              </p>
              <StepList solution={q.solution} />
              {showRubric && q.rubric && (
                <div
                  className="card"
                  style={{ background: "var(--bg-alt, #fef9c3)", marginTop: "0.5rem" }}
                >
                  <strong>Grading rubric:</strong> {q.rubric}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
