import { useState } from "react";
import { renderRichText } from "../lib/renderRichText";
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
          {course.subject} — Theory
        </p>
        <div style={{ lineHeight: 1.7 }}>{renderRichText(course.theory)}</div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Key Concepts</h3>
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
        <h3 style={{ marginTop: 0 }}>Worked Examples</h3>
        {course.workedExamples.map((ex, i) => (
          <div key={i} className="card" style={{ background: "var(--bg-alt, #f8f9fa)", marginBottom: "0.5rem" }}>
            <div
              style={{ cursor: "pointer", userSelect: "none" }}
              onClick={() =>
                setExpandedExample(expandedExample === i ? null : i)
              }
            >
              <strong>Example {i + 1}:</strong> {ex.problem}
              <span style={{ float: "right" }}>
                {expandedExample === i ? "▲" : "▼"}
              </span>
            </div>
            {expandedExample === i && (
              <div style={{ marginTop: "0.75rem", borderTop: "1px solid var(--border, #e5e7eb)", paddingTop: "0.75rem" }}>
                {renderRichText(ex.solution)}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Summary</h3>
        <p>{renderRichText(course.summary)}</p>
      </div>
    </div>
  );
}
