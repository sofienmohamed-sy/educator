import { useEffect } from "react";
import { sectionsFor } from "../lib/sections";

interface Props {
  country: string;
  gradeLevel: string;
  value: string;
  onChange: (section: string) => void;
  label?: string;
}

const OTHER = "__other__";

/**
 * Section / track / filière picker. Renders a labeled `<select>` populated
 * from the (country, gradeLevel) combination — e.g., FR Terminale →
 * Spécialité Maths, NSI, Maths Expertes, …; MA 2ème Bac → Sciences Maths
 * A/B, PC, SVT, …
 *
 * Returns `null` (no DOM at all — including the label) when no sections are
 * catalogued for the current selection, so the picker doesn't add visual
 * noise for countries that don't track-split (US regular grades, BR ENEM,
 * AU/CA/JP/KR/CN).
 *
 * Auto-clears the value when country/level changes to one that doesn't
 * include the previously chosen section.
 */
export default function SectionPicker({
  country,
  gradeLevel,
  value,
  onChange,
  label = "Section / track (optional)",
}: Props) {
  const sections = sectionsFor(country, gradeLevel);
  const hasList = sections.length > 0;
  const inList = hasList && sections.includes(value);
  const isFreeText = hasList && !inList && value !== "";

  useEffect(() => {
    if (hasList && value && !inList) onChange("");
  }, [country, gradeLevel, hasList, inList, value, onChange]);

  if (!hasList) return null;

  return (
    <div>
      <label>{label}</label>
      <div className="row" style={{ gap: "0.5rem", flexWrap: "wrap" }}>
        <select
          value={isFreeText ? OTHER : value}
          onChange={(e) =>
            onChange(e.target.value === OTHER ? value || " " : e.target.value)
          }
        >
          <option value="">— Section / track —</option>
          {sections.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
          <option value={OTHER}>Other…</option>
        </select>
        {isFreeText && (
          <input
            value={value === " " ? "" : value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Custom section / track"
            autoFocus
          />
        )}
      </div>
    </div>
  );
}
