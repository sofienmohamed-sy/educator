import { useEffect } from "react";
import { topicsFor } from "../lib/topics";
import type { Subject } from "../lib/types";

interface Props {
  subject: Subject;
  country: string;
  gradeLevel: string;
  value: string;
  onChange: (topic: string) => void;
  placeholder?: string;
  required?: boolean;
}

const OTHER = "__other__";

/**
 * Topic selector. Renders a `<select>` populated from the chosen
 * (subject, country, gradeLevel) combination, listed in syllabus order.
 * Selecting "Other…" reveals a free-text input so custom topics remain
 * expressible.
 *
 * When subject/country/level changes, any current value not in the new list
 * is cleared so a stale topic can't leak across selections.
 */
export default function TopicPicker({
  subject,
  country,
  gradeLevel,
  value,
  onChange,
  placeholder = "e.g. Quadratic equations",
  required,
}: Props) {
  const topics = topicsFor(country, subject, gradeLevel);
  const hasList = topics.length > 0;
  const inList = hasList && topics.includes(value);
  const isFreeText = !hasList || (!inList && value !== "");

  useEffect(() => {
    if (hasList && value && !inList) onChange("");
  }, [subject, country, gradeLevel, hasList, inList, value, onChange]);

  if (!hasList) {
    return (
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
      />
    );
  }

  return (
    <div className="row" style={{ gap: "0.5rem", flexWrap: "wrap" }}>
      <select
        value={isFreeText ? OTHER : value}
        onChange={(e) => onChange(e.target.value === OTHER ? value || " " : e.target.value)}
        style={{ flex: 1, minWidth: "16rem" }}
        required={required}
      >
        <option value="">— Select a topic —</option>
        {topics.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
        <option value={OTHER}>Other…</option>
      </select>
      {isFreeText && (
        <input
          value={value === " " ? "" : value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus
          required={required}
          style={{ flex: 1, minWidth: "16rem" }}
        />
      )}
    </div>
  );
}
