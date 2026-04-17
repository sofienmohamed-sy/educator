import type { Subject } from "../lib/types";

interface Props {
  value: Subject;
  onChange: (s: Subject) => void;
  label?: string;
}

const OPTIONS: Array<{ value: Subject; label: string }> = [
  { value: "math", label: "Mathematics" },
  { value: "physics", label: "Physics" },
  { value: "chemistry", label: "Chemistry" },
  { value: "informatics", label: "Computer Science" },
];

export default function SubjectPicker({
  value,
  onChange,
  label = "Subject",
}: Props) {
  return (
    <label>
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value as Subject)}>
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
