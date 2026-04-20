import { useState, type FormEvent } from "react";
import { useAuth } from "../auth/AuthProvider";
import CountryPicker from "../components/CountryPicker";
import ProblemInput, { type InputValue } from "../components/ProblemInput";
import WritingSubjectPicker from "../components/WritingSubjectPicker";
import { solveWritingFn } from "../lib/callables";
import { uploadProblemFile, fileContentType } from "../lib/upload";
import type { WritingSubject, WritingAnalysis } from "../lib/types";

function WritingAnalysisDisplay({ analysis }: { analysis: WritingAnalysis }) {
  return (
    <div>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Task</h3>
        <p style={{ margin: 0 }}>{analysis.restatement}</p>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Feedback</h3>
        <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{analysis.feedback}</p>
      </div>

      {analysis.corrections.length > 0 && (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Corrections</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {analysis.corrections.map((c, i) => (
              <div
                key={i}
                style={{
                  borderLeft: "3px solid var(--danger, #ef4444)",
                  paddingLeft: "0.75rem",
                }}
              >
                <div style={{ marginBottom: "0.25rem" }}>
                  <del className="muted" style={{ marginRight: "0.5rem" }}>
                    {c.original}
                  </del>
                  <ins style={{ textDecoration: "none", color: "var(--accent, #6366f1)" }}>
                    {c.corrected}
                  </ins>
                </div>
                <p className="muted" style={{ margin: 0, fontSize: "0.875rem" }}>
                  {c.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {analysis.suggestions.length > 0 && (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Suggestions</h3>
          <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
            {analysis.suggestions.map((s, i) => (
              <li key={i} style={{ marginBottom: "0.25rem" }}>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Conclusion</h3>
        <p style={{ margin: 0 }}>{analysis.conclusion}</p>
      </div>
    </div>
  );
}

export default function WritingSolver() {
  const { user } = useAuth();
  const [country, setCountry] = useState("US");
  const [gradeLevel, setGradeLevel] = useState("");
  const [writingSubject, setWritingSubject] = useState<WritingSubject>("grammar");
  const [input, setInput] = useState<InputValue>({ kind: "text", text: "" });
  const [analysis, setAnalysis] = useState<WritingAnalysis | null>(null);
  const [usedCurated, setUsedCurated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setAnalysis(null);
    setBusy(true);

    try {
      if (input.kind === "text") {
        if (!input.text.trim()) throw new Error("Please type your writing task.");
        const { data } = await solveWritingFn({
          country,
          gradeLevel: gradeLevel || undefined,
          writingSubject,
          input: { kind: "text", text: input.text.trim() },
        });
        setAnalysis(data.analysis);
        setUsedCurated(data.usedCuratedCurriculum);
      } else {
        const path = await uploadProblemFile(user.uid, input.file);
        const { data } = await solveWritingFn({
          country,
          gradeLevel: gradeLevel || undefined,
          writingSubject,
          input: { kind: "storage", path, contentType: fileContentType(input.file) },
        });
        setAnalysis(data.analysis);
        setUsedCurated(data.usedCuratedCurriculum);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="card">
        <h2 style={{ marginTop: 0 }}>Analyze writing</h2>

        <div className="row" style={{ marginBottom: "0.75rem", flexWrap: "wrap" }}>
          <WritingSubjectPicker value={writingSubject} onChange={setWritingSubject} />
          <div>
            <label>Country curriculum</label>
            <CountryPicker value={country} onChange={setCountry} />
          </div>
          <div>
            <label>Grade / level (optional)</label>
            <input
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              placeholder="e.g. Grade 9, Year 11"
            />
          </div>
        </div>

        <div style={{ marginBottom: "0.75rem" }}>
          <label>Writing task</label>
          <ProblemInput value={input} onChange={setInput} />
        </div>

        {error ? <p className="error">{error}</p> : null}

        <button type="submit" className="primary" disabled={busy}>
          {busy ? "Analyzing…" : "Analyze"}
        </button>
      </form>

      {analysis ? (
        <>
          <p className="muted" style={{ marginBottom: "0.5rem" }}>
            {usedCurated
              ? "Using curated curriculum profile from Firestore."
              : "Using Claude's built-in knowledge of the selected country's curriculum."}
          </p>
          <WritingAnalysisDisplay analysis={analysis} />
        </>
      ) : null}
    </div>
  );
}
