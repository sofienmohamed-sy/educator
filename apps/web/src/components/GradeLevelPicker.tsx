import { useEffect } from "react";
import { gradeLevelsFor } from "../lib/gradeLevels";

interface Props {
  country: string;
  value: string;
  onChange: (gradeLevel: string) => void;
  placeholder?: string;
}

const OTHER = "__other__";

/**
 * Grade-level selector. Renders a `<select>` populated from the selected
 * country's curriculum (e.g. FR → Seconde / Première / Terminale). Choosing
 * "Other…" or selecting a country without a curated list reveals a free-text
 * input so unusual levels (mid-year, repeat, special programs) remain
 * expressible.
 *
 * When the country changes, any current value that isn't in the new list is
 * cleared so a stale grade level can't leak across countries.
 */
export default function GradeLevelPicker({
  country,
  value,
  onChange,
  placeholder = "e.g. Terminale, Grade 12",
}: Props) {
  const levels = gradeLevelsFor(country);
  const hasList = levels.length > 0;
  const inList = hasList && levels.includes(value);
  const isFreeText = !hasList || (!inList && value !== "");

  useEffect(() => {
    if (hasList && value && !inList) onChange("");
  }, [country, hasList, inList, value, onChange]);

  if (!hasList) {
    return (
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    );
  }

  return (
    <div className="row" style={{ gap: "0.5rem" }}>
      <select
        value={isFreeText ? OTHER : value}
        onChange={(e) => onChange(e.target.value === OTHER ? value || " " : e.target.value)}
      >
        <option value="">—</option>
        {levels.map((lvl) => (
          <option key={lvl} value={lvl}>
            {lvl}
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
        />
      )}
    </div>
  );
}
