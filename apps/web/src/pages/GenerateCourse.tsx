import { useState, useRef, type FormEvent } from "react";
import CountryPicker from "../components/CountryPicker";
import SubjectPicker from "../components/SubjectPicker";
import CourseViewer from "../components/CourseViewer";
import BookList from "../components/BookList";
import { listBooksFn } from "../lib/callables";
import { streamGenerate } from "../lib/streamClient";
import type { Course, Subject, BookMeta } from "../lib/types";

type CourseResult = { course: Course };

export default function GenerateCourse() {
  const [subject, setSubject] = useState<Subject>("math");
  const [topic, setTopic] = useState("");
  const [country, setCountry] = useState("US");
  const [gradeLevel, setGradeLevel] = useState("");
  const [language, setLanguage] = useState("");

  const [books, setBooks] = useState<BookMeta[]>([]);
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);
  const [booksLoaded, setBooksLoaded] = useState(false);
  const [booksLoading, setBooksLoading] = useState(false);

  const [course, setCourse] = useState<Course | null>(null);
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
    setCourse(null);
    setStreamText("");
    setBusy(true);

    try {
      const gen = streamGenerate<CourseResult>("generateCourseStream", {
        subject,
        topic: topic.trim(),
        country,
        gradeLevel: gradeLevel || undefined,
        language: language || undefined,
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
          setCourse(event.course);
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
        <h2 style={{ marginTop: 0 }}>Generate a course</h2>

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
              placeholder="e.g. Terminale"
            />
          </div>
          <div>
            <label>Language (optional)</label>
            <input
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              placeholder="e.g. fr, en"
            />
          </div>
        </div>

        <div style={{ marginBottom: "0.75rem" }}>
          <label>Topic</label>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Quadratic equations"
            required
          />
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
          {booksLoaded && books.length === 0 && (
            <p className="muted">No ready books for this subject.</p>
          )}
        </div>

        {error && <p className="error">{error}</p>}

        <button type="submit" className="primary" disabled={busy || !topic.trim()}>
          {busy ? "Generating…" : "Generate course"}
        </button>
      </form>

      {busy && streamText && (
        <div className="card" style={{ marginTop: "1rem" }}>
          <p className="muted" style={{ marginBottom: "0.5rem", fontSize: "0.85rem" }}>
            Claude is generating your course…
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

      {course && (
        <div style={{ marginTop: "1rem" }}>
          <CourseViewer course={course} />
        </div>
      )}
    </div>
  );
}
