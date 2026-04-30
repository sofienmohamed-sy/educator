import { useState } from "react";
import { renderRichText, renderMarkdown } from "../lib/renderRichText";
import GeometryFigure from "./GeometryFigure";
import type { Course } from "../lib/types";

interface Props {
  course: Course;
}

export default function CourseViewer({ course }: Props) {
  const [expandedExample, setExpandedExample] = useState<number | null>(null);

  return (
    <div>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>{course.topic}</h2>
        <p className="muted" style={{ marginBottom: "1rem" }}>
          {course.subject}
        </p>
        <div>{renderMarkdown(course.theory, course.figures)}</div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Concepts clés</h3>
        <dl>
          {course.keyConcepts.map((kc, i) => (
            <div key={i} style={{ marginBottom: "0.75rem" }}>
              <dt>
                <strong>{kc.term}</strong>
              </dt>
              <dd style={{ marginLeft: "1rem" }}>
                {renderRichText(kc.definition)}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Applications</h3>
        {course.workedExamples.map((ex, i) => (
          <div
            key={i}
            className="card"
            style={{ background: "var(--bg-alt, #f8f9fa)", marginBottom: "0.5rem" }}
          >
            <div style={{ fontWeight: 600, marginBottom: "0.4rem" }}>
              Application {i + 1}
            </div>
            <div style={{ marginBottom: "0.5rem" }}>
              {renderMarkdown(ex.problem)}
            </div>
            {ex.figure && <GeometryFigure spec={ex.figure} />}
            <div
              style={{
                cursor: "pointer",
                userSelect: "none",
                color: "var(--accent, #2563eb)",
                fontSize: 13,
                marginTop: "0.4rem",
              }}
              onClick={() =>
                setExpandedExample(expandedExample === i ? null : i)
              }
            >
              {expandedExample === i ? "▲ Masquer la solution" : "▼ Voir la solution"}
            </div>
            {expandedExample === i && (
              <div
                style={{
                  marginTop: "0.75rem",
                  borderTop: "1px solid var(--border, #e5e7eb)",
                  paddingTop: "0.75rem",
                }}
              >
                {renderMarkdown(ex.solution)}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Résumé</h3>
        <div>{renderMarkdown(course.summary)}</div>
      </div>
    </div>
  );
}
