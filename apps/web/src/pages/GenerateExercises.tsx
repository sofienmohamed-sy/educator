import { useState, useRef, type FormEvent } from "react";
import CountryPicker from "../components/CountryPicker";
import SubjectPicker from "../components/SubjectPicker";
import ExerciseList from "../components/ExerciseList";
import BookList from "../components/BookList";
import { listBooksFn } from "../lib/callables";
import { streamGenerate } from "../lib/streamClient";
import type { Exercise, Subject, BookMeta } from "../lib/types";

type Difficulty = "easy" | "medium" | "hard";
type ExercisesResult = { exercises: Exercise[] };

export default function GenerateExercises() {
  const [subject, setSubject] = useState<Subject>("math");
  const [topic, setTopic] = useState("");
  const [country, setCountry] = useState("US");
  const [gradeLevel, setGradeLevel] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [count, setCount] = useState(5);

  const [books, setBooks] = useState<BookMeta[]>([]);
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);
  const [booksLoaded, setBooksLoaded] = useState(false);
  const [booksLoading, setBooksLoading] = useState(false);

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [streamText, setStreamText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<HTMLPreElement>(null);

  async function loadBooks() {
    setBooksLoading(true);
    try {
      const { data } = await listBooksFn({ subject });
      setBooks(data.books.filter((b) => b.status === "ready" && (b.chunkCount ?? 0) > 0));
      setBooksLoaded(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBooksLoading(false);
    }
  }

  function toggleBook(id: string) {
    setSelectedBookIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!topic.trim()) return;
    setError(null);
    setExercises([]);
    setStreamText("");
    setBusy(true);

    try {
      const gen = streamGenerate<ExercisesResult>("generateExercisesStream", {
        subject,
        topic: topic.trim(),
        country,
        gradeLevel: gradeLevel || undefined,
        difficulty,
        count,
        bookIds: selectedBookIds.length ? selectedBookIds : undefined,
      });

      for await (const event of gen) {
        if (event.type === "delta") {
          setStreamText((prev) => {
            const next = prev + event.text;
            requestAnimationFrame(() => {
              if (streamRef.current) {
                streamRef.current.scrollTop = streamRef.current.scrollHeight;
              }
            });
            return next;
          });
        } else if (event.type === "result") {
          setExercises(event.exercises);
          setStreamText("");
        } else if (event.type === "error") {
          setError(event.message);
        }
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
        <h2 style={{ marginTop: 0 }}>Generate exercises</h2>

        <div className="row" style={{ flexWrap: "wrap", marginBottom: "0.75rem" }}>
          <SubjectPicker value={subject} onChange={setSubject} />
          <div>
            <label>Country curriculum</label>
            <CountryPicker value={country} onChange={setCountry} />
          </div>
          <div>
            <label>Grade / level (optional)</label>
            <input
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              placeholder="e.g. Grade 10"
            />
          </div>
        </div>

        <div style={{ marginBottom: "0.75rem" }}>
          <label>Topic</label>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Integration by parts"
            required
          />
        </div>

        <div className="row" style={{ marginBottom: "0.75rem", flexWrap: "wrap" }}>
          <div>
            <label>Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div>
            <label>Number of exercises ({count})</label>
            <input
              type="range"
              min={1}
              max={20}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              style={{ width: "160px" }}
            />
          </div>
        </div>

        <div style={{ marginBottom: "0.75rem" }}>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <label>Reference books (optional)</label>
            <button type="button" onClick={loadBooks} disabled={booksLoading} style={{ fontSize: "0.8rem" }}>
              {booksLoading ? "Loading…" : "Load library"}
            </button>
          </div>
          {booksLoaded && books.length > 0 && (
            <BookList books={books} role="student" selectedIds={selectedBookIds} onToggle={toggleBook} />
          )}
        </div>

        {error && <p className="error">{error}</p>}

        <button type="submit" className="primary" disabled={busy || !topic.trim()}>
          {busy ? "Generating…" : "Generate exercises"}
        </button>
      </form>

      {busy && streamText && (
        <div className="card" style={{ marginTop: "1rem" }}>
          <p className="muted" style={{ marginBottom: "0.5rem", fontSize: "0.85rem" }}>
            Claude is generating your exercises…
          </p>
          <pre
            ref={streamRef}
            style={{
              fontFamily: "monospace",
              fontSize: "0.78rem",
              color: "var(--muted, #6b7280)",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              maxHeight: "300px",
              overflowY: "auto",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {streamText}▌
          </pre>
        </div>
      )}

      {exercises.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <ExerciseList exercises={exercises} />
        </div>
      )}
    </div>
  );
}
