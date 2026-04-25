interface StageDefinition {
  key: string;
  label: string;
}

interface Props {
  streamText: string;
  stages: StageDefinition[];
  label: string;
}

/**
 * Shows a progress indicator during streaming. Detects which JSON field is
 * currently being written by scanning for field name keys in the accumulated text.
 */
export default function StreamProgress({ streamText, stages, label }: Props) {
  let currentStage = 0;
  for (let i = stages.length - 1; i >= 0; i--) {
    if (streamText.includes(`"${stages[i].key}"`)) {
      currentStage = i;
      break;
    }
  }

  const pct = Math.round(((currentStage + 1) / stages.length) * 100);

  return (
    <div className="card" style={{ marginTop: "1rem" }}>
      <p style={{ margin: "0 0 0.5rem", fontWeight: 600 }}>{label}</p>
      <p className="muted" style={{ margin: "0 0 0.75rem", fontSize: "0.85rem" }}>
        {stages[currentStage].label}
      </p>
      <div
        style={{
          height: "6px",
          background: "var(--border, #e5e7eb)",
          borderRadius: "3px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: "var(--accent, #2563eb)",
            borderRadius: "3px",
            transition: "width 0.4s ease",
          }}
        />
      </div>
      <p className="muted" style={{ margin: "0.5rem 0 0", fontSize: "0.75rem", textAlign: "right" }}>
        {pct}%
      </p>
    </div>
  );
}
