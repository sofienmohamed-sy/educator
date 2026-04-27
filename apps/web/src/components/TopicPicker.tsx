import { useEffect } from "react";
import { topicsFor, topicValue } from "../lib/topics";
import type { Subject } from "../lib/types";

interface Props {
  subject: Subject;
  country: string;
  gradeLevel: string;
  section?: string;
  value: string;
  onChange: (topic: string) => void;
  placeholder?: string;
  required?: boolean;
}

const OTHER = "__other__";

/**
 * Topic selector. Renders a `<select>` populated from the chosen
 * (subject, country, gradeLevel, section) combination, listed in syllabus
 * order. Selecting "Other…" reveals a free-text input so custom topics
 * remain expressible.
 *
 * The dropdown shows the short chapter `label`; the option's underlying
 * value is `${label} — ${limits}` when a scope description exists, so the
 * AI receives the program-limit context along with the chapter name.
 *
 * When subject/country/level/section changes, any current value not in the
 * new list is cleared so a stale topic can't leak across selections.
 */
export default function TopicPicker({
  subject,
  country,
  gradeLevel,
  section,
  value,
  onChange,
  placeholder = "e.g. Quadratic equations",
  required,
}: Props) {
  const topics = topicsFor(country, subject, gradeLevel, section);
  const hasList = topics.length > 0;
  const inList =
    hasList &&
    topics.some((t) => topicValue(t) === value || t.label === value);
  const isFreeText = !hasList || (!inList && value !== "");

  useEffect(() => {
    if (hasList && value && !inList) onChange("");
  }, [subject, country, gradeLevel, section, hasList, inList, value, onChange]);

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
          <option
            key={t.label}
            value={topicValue(t)}
            title={t.limits || undefined}
          >
            {t.label}
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
