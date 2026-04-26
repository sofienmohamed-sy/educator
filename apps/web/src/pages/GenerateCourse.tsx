import { useState, type FormEvent } from "react";
import CountryPicker from "../components/CountryPicker";
import GradeLevelPicker from "../components/GradeLevelPicker";
import SectionPicker from "../components/SectionPicker";
import SubjectPicker from "../components/SubjectPicker";
import TopicPicker from "../components/TopicPicker";
import CourseViewer from "../components/CourseViewer";
import StreamProgress from "../components/StreamProgress";
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
  const [section, setSection] = useState("");
  const [language, setLanguage] = useState("");

  const [books, setBooks] = useState<BookMeta[]>([]);
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);
  const [booksLoaded, setBooksLoaded] = useState(false);
  const [booksLoading, setBooksLoading] = useState(false);

  const [course, setCourse] = useState<Course | null>(null);
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
    setCourse(null);
    setStreamText("");
    setBusy(true);

    try {
      const gen = streamGenerate<CourseResult>("generateCourseStream", {
        subject,
        topic: topic.trim(),
        country,
        gradeLevel: gradeLevel || undefined,
        section: section || undefined,
        language: language || undefined,
        bookIds: selectedBookIds.length ? selectedBookIds : undefined,
      });

      for await (const event of gen) {
        if (event.type === "delta") {
          setStreamText((prev) => prev + event.text);
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
            <GradeLevelPicker country={country} value={gradeLevel} onChange={setGradeLevel} />
          </div>
          <SectionPicker
            country={country}
            gradeLevel={gradeLevel}
            value={section}
            onChange={setSection}
          />
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
          <TopicPicker
            subject={subject}
            country={country}
            gradeLevel={gradeLevel}
            value={topic}
            onChange={setTopic}
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

      {busy && (
        <StreamProgress
          streamText={streamText}
          label="Claude is generating your course…"
          stages={[
            { key: "subject",        label: "Starting up…" },
            { key: "theory",         label: "Writing theory section…" },
            { key: "keyConcepts",    label: "Building key concepts…" },
            { key: "workedExamples", label: "Creating worked examples…" },
            { key: "summary",        label: "Writing summary…" },
          ]}
        />
      )}

      {course && (
        <div style={{ marginTop: "1rem" }}>
          <CourseViewer course={course} />
        </div>
      )}
    </div>
  );
}
