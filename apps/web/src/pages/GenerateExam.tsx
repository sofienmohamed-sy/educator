import { useState, useEffect, type FormEvent } from "react";
import CountryPicker from "../components/CountryPicker";
import GradeLevelPicker from "../components/GradeLevelPicker";
import SectionPicker from "../components/SectionPicker";
import SubjectPicker from "../components/SubjectPicker";
import TopicPicker from "../components/TopicPicker";
import ExamViewer from "../components/ExamViewer";
import StreamProgress from "../components/StreamProgress";
import BookList from "../components/BookList";
import { listBooksFn, getProfileFn } from "../lib/callables";
import { streamGenerate } from "../lib/streamClient";
import { useAuth } from "../auth/AuthProvider";
import type { Exam, Subject, BookMeta, UserRole } from "../lib/types";

type ExamResult = { exam: Exam };

export default function GenerateExam() {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>("student");
  const [subject, setSubject] = useState<Subject>("math");
  const [topics, setTopics] = useState<string[]>(["", ""]);
  const [country, setCountry] = useState("US");
  const [gradeLevel, setGradeLevel] = useState("");
  const [section, setSection] = useState("");
  const [totalPoints, setTotalPoints] = useState(100);

  const [books, setBooks] = useState<BookMeta[]>([]);
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);
  const [booksLoaded, setBooksLoaded] = useState(false);
  const [booksLoading, setBooksLoading] = useState(false);

  const [exam, setExam] = useState<Exam | null>(null);
  const [streamText, setStreamText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    getProfileFn({})
      .then(({ data }) => { if (data) setRole(data.role); })
      .catch(console.error);
  }, [user]);

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

  function updateTopic(i: number, val: string) {
    setTopics((prev) => prev.map((t, j) => (j === i ? val : t)));
  }

  function addTopic() {
    if (topics.length < 10) setTopics((prev) => [...prev, ""]);
  }

  function removeTopic(i: number) {
    if (topics.length > 1) setTopics((prev) => prev.filter((_, j) => j !== i));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const validTopics = topics.map((t) => t.trim()).filter(Boolean);
    if (!validTopics.length) return;
    setError(null);
    setExam(null);
    setStreamText("");
    setBusy(true);

    try {
      const gen = streamGenerate<ExamResult>("generateExamStream", {
        subject,
        topics: validTopics,
        country,
        gradeLevel: gradeLevel || undefined,
        section: section || undefined,
        totalPoints,
        bookIds: selectedBookIds.length ? selectedBookIds : undefined,
      });

      for await (const event of gen) {
        if (event.type === "delta") {
          setStreamText((prev) => prev + event.text);
        } else if (event.type === "result") {
          setExam(event.exam);
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
        <h2 style={{ marginTop: 0 }}>Generate an exam</h2>
        <p className="muted" style={{ marginBottom: "1rem" }}>
          Questions are distributed: 60% direct · 20% indirect · 20% synthesis
        </p>

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
            <label>Total points ({totalPoints})</label>
            <input
              type="range"
              min={20}
              max={200}
              step={5}
              value={totalPoints}
              onChange={(e) => setTotalPoints(Number(e.target.value))}
              style={{ width: "160px" }}
            />
          </div>
        </div>

        <div style={{ marginBottom: "0.75rem" }}>
          <label>Topics (at least one)</label>
          {topics.map((t, i) => (
            <div
              key={i}
              className="row"
              style={{ marginBottom: "0.4rem", gap: "0.5rem", alignItems: "flex-start" }}
            >
              <div style={{ flex: 1 }}>
                <TopicPicker
                  subject={subject}
                  country={country}
                  gradeLevel={gradeLevel}
                  section={section}
                  value={t}
                  onChange={(v) => updateTopic(i, v)}
                  placeholder={`Topic ${i + 1}`}
                />
              </div>
              {topics.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTopic(i)}
                  style={{ padding: "0.3rem 0.6rem" }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          {topics.length < 10 && (
            <button type="button" onClick={addTopic} style={{ fontSize: "0.85rem" }}>
              + Add topic
            </button>
          )}
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

        <button
          type="submit"
          className="primary"
          disabled={busy || !topics.some((t) => t.trim())}
        >
          {busy ? "Generating…" : "Generate exam"}
        </button>
      </form>

      {busy && (
        <StreamProgress
          streamText={streamText}
          label="Claude is generating your exam…"
          stages={[
            { key: "subject",   label: "Starting up…" },
            { key: "questions", label: "Writing questions…" },
            { key: "choices",   label: "Building answer choices…" },
            { key: "rubric",    label: "Writing rubric…" },
          ]}
        />
      )}

      {exam && (
        <div style={{ marginTop: "1rem" }}>
          <ExamViewer exam={exam} showRubric={role === "professor"} />
        </div>
      )}
    </div>
  );
}
