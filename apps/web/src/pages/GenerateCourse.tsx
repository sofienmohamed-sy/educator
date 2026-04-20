import { useState, type FormEvent } from "react";
import CountryPicker from "../components/CountryPicker";
import SubjectPicker from "../components/SubjectPicker";
import CourseViewer from "../components/CourseViewer";
import { generateCourseFn, listBooksFn } from "../lib/callables";
import type { Course, Subject, BookMeta } from "../lib/types";
import BookList from "../components/BookList";

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
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadBooks() {
    setBooksLoading(true);
    try {
      const { data } = await listBooksFn({ subject });
      setBooks(data.books.filter((b) => b.status === "ready"));
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
    setBusy(true);
    try {
      const { data } = await generateCourseFn({
        subject,
        topic: topic.trim(),
        country,
        gradeLevel: gradeLevel || undefined,
        language: language || undefined,
        bookIds: selectedBookIds.length ? selectedBookIds : undefined,
      });
      setCourse(data.course);
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
            <BookList
              books={books}
              role="student"
              selectedIds={selectedBookIds}
              onToggle={toggleBook}
            />
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

      {course && (
        <div style={{ marginTop: "1rem" }}>
          <CourseViewer course={course} />
        </div>
      )}
    </div>
  );
}
