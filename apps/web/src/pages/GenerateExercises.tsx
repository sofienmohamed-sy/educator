import { useState, type FormEvent } from "react";
import CountryPicker from "../components/CountryPicker";
import GradeLevelPicker from "../components/GradeLevelPicker";
import SectionPicker from "../components/SectionPicker";
import SubjectPicker from "../components/SubjectPicker";
import TopicPicker from "../components/TopicPicker";
import ExerciseList from "../components/ExerciseList";
import StreamProgress from "../components/StreamProgress";
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
  const [section, setSection] = useState("");
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
        section: section || undefined,
        difficulty,
        count,
        bookIds: selectedBookIds.length ? selectedBookIds : undefined,
      });

      for await (const event of gen) {
        if (event.type === "delta") {
          setStreamText((prev) => prev + event.text);
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
            <GradeLevelPicker country={country} value={gradeLevel} onChange={setGradeLevel} />
          </div>
          <SectionPicker
            country={country}
            gradeLevel={gradeLevel}
            value={section}
            onChange={setSection}
          />
        </div>

        <div style={{ marginBottom: "0.75rem" }}>
          <label>Topic</label>
          <TopicPicker
            subject={subject}
            country={country}
            gradeLevel={gradeLevel}
            value={topic}
            onChange={setTopic}
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

      {busy && (
        <StreamProgress
          streamText={streamText}
          label="Claude is generating your exercises…"
          stages={[
            { key: "exercises",  label: "Starting up…" },
            { key: "problem",    label: "Writing problems…" },
            { key: "solution",   label: "Solving exercises…" },
            { key: "hint",       label: "Adding hints…" },
          ]}
        />
      )}

      {exercises.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <ExerciseList exercises={exercises} />
        </div>
      )}
    </div>
  );
}
