import { useState, type FormEvent } from "react";
import { useAuth } from "../auth/AuthProvider";
import CountryPicker from "../components/CountryPicker";
import GradeLevelPicker from "../components/GradeLevelPicker";
import ProblemInput, { type InputValue } from "../components/ProblemInput";
import SubjectPicker from "../components/SubjectPicker";
import StepList, { type Solution } from "../components/StepList";
import { fileContentType, uploadProblemFile } from "../lib/upload";
import { solveProblem } from "../lib/solve";
import type { Subject } from "../lib/types";

export default function Solve() {
  const { user } = useAuth();
  const [country, setCountry] = useState("US");
  const [gradeLevel, setGradeLevel] = useState("");
  const [subject, setSubject] = useState<Subject>("math");
  const [input, setInput] = useState<InputValue>({ kind: "text", text: "" });
  const [solution, setSolution] = useState<Solution | null>(null);
  const [usedCurated, setUsedCurated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setSolution(null);
    setBusy(true);

    try {
      if (input.kind === "text") {
        if (!input.text.trim()) throw new Error("Please type a problem.");
        const res = await solveProblem({
          country,
          gradeLevel: gradeLevel || undefined,
          subject,
          input: { kind: "text", text: input.text.trim() },
        });
        setSolution(res.solution);
        setUsedCurated(res.usedCuratedCurriculum);
      } else {
        const path = await uploadProblemFile(user.uid, input.file);
        const res = await solveProblem({
          country,
          gradeLevel: gradeLevel || undefined,
          subject,
          input: {
            kind: "storage",
            path,
            contentType: fileContentType(input.file),
          },
        });
        setSolution(res.solution);
        setUsedCurated(res.usedCuratedCurriculum);
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
        <h2 style={{ marginTop: 0 }}>New problem</h2>

        <div className="row" style={{ marginBottom: "0.75rem", flexWrap: "wrap" }}>
          <SubjectPicker value={subject} onChange={setSubject} />
          <div>
            <label>Country curriculum</label>
            <CountryPicker value={country} onChange={setCountry} />
          </div>
          <div>
            <label>Grade / level (optional)</label>
            <GradeLevelPicker country={country} value={gradeLevel} onChange={setGradeLevel} />
          </div>
        </div>

        <div style={{ marginBottom: "0.75rem" }}>
          <label>Problem</label>
          <ProblemInput value={input} onChange={setInput} />
        </div>

        {error ? <p className="error">{error}</p> : null}

        <button type="submit" className="primary" disabled={busy}>
          {busy ? "Solving…" : "Solve"}
        </button>
      </form>

      {solution ? (
        <>
          <p className="muted" style={{ marginBottom: "0.5rem" }}>
            {usedCurated
              ? "Using curated curriculum profile from Firestore."
              : "Using Claude's built-in knowledge of the selected country's curriculum."}
          </p>
          <StepList solution={solution} />
        </>
      ) : null}
    </div>
  );
}
