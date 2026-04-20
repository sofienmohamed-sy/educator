import type { WritingSubject } from "../lib/types";

interface Props {
  value: WritingSubject;
  onChange: (s: WritingSubject) => void;
  label?: string;
}

const OPTIONS: Array<{ value: WritingSubject; label: string }> = [
  { value: "grammar", label: "Grammar" },
  { value: "essay", label: "Essay Writing" },
  { value: "vocabulary", label: "Vocabulary" },
  { value: "literature", label: "Literary Analysis" },
  { value: "reading", label: "Reading Comprehension" },
];

export default function WritingSubjectPicker({
  value,
  onChange,
  label = "Writing subject",
}: Props) {
  return (
    <label>
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as WritingSubject)}
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
