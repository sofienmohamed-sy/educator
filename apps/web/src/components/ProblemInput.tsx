import { useState, type ChangeEvent } from "react";

export type InputValue =
  | { kind: "text"; text: string }
  | { kind: "file"; file: File };

interface Props {
  value: InputValue;
  onChange: (v: InputValue) => void;
}

export default function ProblemInput({ value, onChange }: Props) {
  const [tab, setTab] = useState<"text" | "file">(value.kind === "file" ? "file" : "text");

  function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    onChange({ kind: "file", file });
  }

  return (
    <div>
      <div className="row" style={{ marginBottom: "0.5rem" }}>
        <button
          type="button"
          onClick={() => {
            setTab("text");
            onChange({ kind: "text", text: value.kind === "text" ? value.text : "" });
          }}
          className={tab === "text" ? "primary" : ""}
        >
          Type problem
        </button>
        <button
          type="button"
          onClick={() => setTab("file")}
          className={tab === "file" ? "primary" : ""}
        >
          Upload image / PDF
        </button>
      </div>

      {tab === "text" ? (
        <textarea
          placeholder="e.g. Solve for x: 2x² − 5x − 3 = 0"
          value={value.kind === "text" ? value.text : ""}
          onChange={(e) => onChange({ kind: "text", text: e.target.value })}
        />
      ) : (
        <div>
          <input type="file" accept="image/*,application/pdf" onChange={onFile} />
          {value.kind === "file" ? (
            <p className="muted">Selected: {value.file.name} ({Math.round(value.file.size / 1024)} KB)</p>
          ) : null}
        </div>
      )}
    </div>
  );
}
