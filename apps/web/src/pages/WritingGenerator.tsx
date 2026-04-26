import { useState, type FormEvent } from "react";
import CountryPicker from "../components/CountryPicker";
import GradeLevelPicker from "../components/GradeLevelPicker";
import SectionPicker from "../components/SectionPicker";
import WritingSubjectPicker from "../components/WritingSubjectPicker";
import { generateWritingFn } from "../lib/callables";
import type { WritingSubject, WritingContent, WritingItem } from "../lib/types";

type ContentType = "lesson" | "exercise" | "quiz" | "essay_prompt";
type Difficulty = "easy" | "medium" | "hard";

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  lesson: "Lesson",
  exercise: "Exercises",
  quiz: "Quiz",
  essay_prompt: "Essay Prompt",
};

function WritingItemCard({ item, index }: { item: WritingItem; index: number }) {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div className="card" style={{ marginBottom: "0.75rem" }}>
      <p style={{ margin: "0 0 0.5rem", fontWeight: 600 }}>
        {index + 1}. {item.prompt}
      </p>
      {item.hints && item.hints.length > 0 && (
        <ul className="muted" style={{ margin: "0 0 0.5rem", paddingLeft: "1.25rem", fontSize: "0.875rem" }}>
          {item.hints.map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ul>
      )}
      <button
        type="button"
        style={{ fontSize: "0.8rem" }}
        onClick={() => setShowAnswer((v) => !v)}
      >
        {showAnswer ? "Hide answer" : "Show answer"}
      </button>
      {showAnswer && (
        <div style={{ marginTop: "0.5rem" }}>
          <p style={{ margin: "0 0 0.25rem", fontWeight: 500 }}>{item.answer}</p>
          <p className="muted" style={{ margin: 0, fontSize: "0.875rem" }}>
            {item.explanation}
          </p>
        </div>
      )}
    </div>
  );
}

function WritingContentDisplay({ content }: { content: WritingContent }) {
  return (
    <div>
      <div className="card">
        <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h2 style={{ margin: "0 0 0.25rem" }}>{content.title}</h2>
            <span className="muted" style={{ fontSize: "0.875rem" }}>
              {CONTENT_TYPE_LABELS[content.contentType]} · {content.writingSubject}
            </span>
          </div>
        </div>
      </div>

      {content.theory && (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Theory</h3>
          <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{content.theory}</p>
        </div>
      )}

      {content.keyConcepts && content.keyConcepts.length > 0 && (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Key Concepts</h3>
          <dl style={{ margin: 0 }}>
            {content.keyConcepts.map((kc, i) => (
              <div key={i} style={{ marginBottom: "0.5rem" }}>
                <dt style={{ fontWeight: 600 }}>{kc.term}</dt>
                <dd style={{ margin: "0 0 0 1rem" }} className="muted">
                  {kc.definition}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {content.prompt && (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Prompt</h3>
          <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{content.prompt}</p>
        </div>
      )}

      {content.criteria && content.criteria.length > 0 && (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Evaluation Criteria</h3>
          <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
            {content.criteria.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      {content.tips && content.tips.length > 0 && (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Writing Tips</h3>
          <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
            {content.tips.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
      )}

      {content.items && content.items.length > 0 && (
        <div>
          <h3 style={{ marginBottom: "0.5rem" }}>Items</h3>
          {content.items.map((item, i) => (
            <WritingItemCard key={i} item={item} index={i} />
          ))}
        </div>
      )}

      {content.summary && (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Summary</h3>
          <p style={{ margin: 0 }}>{content.summary}</p>
        </div>
      )}
    </div>
  );
}

export default function WritingGenerator() {
  const [writingSubject, setWritingSubject] = useState<WritingSubject>("grammar");
  const [contentType, setContentType] = useState<ContentType>("exercise");
  const [topic, setTopic] = useState("");
  const [country, setCountry] = useState("US");
  const [gradeLevel, setGradeLevel] = useState("");
  const [section, setSection] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [count, setCount] = useState(5);
  const [content, setContent] = useState<WritingContent | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showDifficultyAndCount =
    contentType === "exercise" || contentType === "quiz";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!topic.trim()) return;
    setError(null);
    setContent(null);
    setBusy(true);
    try {
      const { data } = await generateWritingFn({
        writingSubject,
        contentType,
        topic: topic.trim(),
        country,
        gradeLevel: gradeLevel || undefined,
        section: section || undefined,
        difficulty: showDifficultyAndCount ? difficulty : undefined,
        count: showDifficultyAndCount ? count : undefined,
      });
      setContent(data.content);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="card">
        <h2 style={{ marginTop: 0 }}>Generate writing content</h2>

        <div className="row" style={{ flexWrap: "wrap", marginBottom: "0.75rem" }}>
          <WritingSubjectPicker value={writingSubject} onChange={setWritingSubject} />
          <label>
            Content type
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value as ContentType)}
            >
              <option value="lesson">Lesson</option>
              <option value="exercise">Exercises</option>
              <option value="quiz">Quiz</option>
              <option value="essay_prompt">Essay Prompt</option>
            </select>
          </label>
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
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Subject-verb agreement, Persuasive writing, Metaphor"
            required
          />
        </div>

        {showDifficultyAndCount && (
          <div className="row" style={{ marginBottom: "0.75rem", flexWrap: "wrap" }}>
            <label>
              Difficulty
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </label>
            <div>
              <label>Number of items ({count})</label>
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
        )}

        {error && <p className="error">{error}</p>}

        <button type="submit" className="primary" disabled={busy || !topic.trim()}>
          {busy ? "Generating…" : "Generate"}
        </button>
      </form>

      {content && (
        <div style={{ marginTop: "1rem" }}>
          <WritingContentDisplay content={content} />
        </div>
      )}
    </div>
  );
}
