import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  limit,
  orderBy,
  query,
  onSnapshot,
  type Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../auth/AuthProvider";

type HistoryTab = "problems" | "courses" | "exercises" | "exams";

interface HistoryDoc {
  id: string;
  createdAt?: Timestamp;
  subject?: string;
  topic?: string;
  topics?: string[];
  country?: string;
  solution?: { restatement?: string; finalAnswer?: string };
  course?: { topic?: string; subject?: string };
  difficulty?: string;
  totalPoints?: number;
  exam?: { title?: string };
}

const NAV_CARDS = [
  {
    to: "/solve",
    title: "Solve a problem",
    desc: "Upload an image, PDF, or type your scientific problem. Get a step-by-step solution following your country's curriculum.",
    cta: "Solve →",
  },
  {
    to: "/generate/course",
    title: "Generate a course",
    desc: "Create a complete lesson on any topic — theory, key concepts, and worked examples — aligned to the curriculum.",
    cta: "Generate →",
  },
  {
    to: "/generate/exercises",
    title: "Practice exercises",
    desc: "Generate sets of exercises at easy, medium, or hard difficulty with full step-by-step solutions.",
    cta: "Generate →",
  },
  {
    to: "/generate/exam",
    title: "Create an exam",
    desc: "Generate exams with 60% direct, 20% indirect, and 20% synthesis questions. Includes answer key and rubric.",
    cta: "Generate →",
  },
  {
    to: "/library",
    title: "Book library",
    desc: "Browse uploaded scientific textbooks. Professors can upload books to power the RAG system.",
    cta: "Browse →",
  },
];

export default function Home() {
  const { user } = useAuth();
  const [tab, setTab] = useState<HistoryTab>("problems");
  const [items, setItems] = useState<HistoryDoc[]>([]);

  useEffect(() => {
    if (!user) return;
    const collectionName =
      tab === "problems"
        ? "problems"
        : tab === "courses"
          ? "courses"
          : tab === "exercises"
            ? "exercises"
            : "exams";

    const q = query(
      collection(db, "users", user.uid, collectionName),
      orderBy("createdAt", "desc"),
      limit(20),
    );

    const unsub = onSnapshot(q, (snap) => {
      setItems(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<HistoryDoc, "id">),
        })),
      );
    });
    return unsub;
  }, [user, tab]);

  function renderItem(item: HistoryDoc) {
    if (tab === "problems") {
      return (
        <span>
          <strong>{item.subject ?? "math"}</strong> · {item.country} —{" "}
          {item.solution?.restatement ?? "(no restatement)"}
          <br />
          <span className="muted">→ {item.solution?.finalAnswer ?? ""}</span>
        </span>
      );
    }
    if (tab === "courses") {
      return (
        <span>
          <strong>{item.subject}</strong> — {item.topic}
        </span>
      );
    }
    if (tab === "exercises") {
      return (
        <span>
          <strong>{item.subject}</strong> — {item.topic}{" "}
          <span className="muted">({item.difficulty})</span>
        </span>
      );
    }
    // exams
    return (
      <span>
        <strong>{item.subject}</strong> — {item.exam?.title ?? item.topics?.join(", ")}{" "}
        <span className="muted">({item.totalPoints} pts)</span>
      </span>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        {NAV_CARDS.map((card) => (
          <div key={card.to} className="card">
            <h3 style={{ marginTop: 0 }}>{card.title}</h3>
            <p className="muted" style={{ marginBottom: "0.75rem", fontSize: "0.9rem" }}>
              {card.desc}
            </p>
            <Link to={card.to}>
              <button className="primary">{card.cta}</button>
            </Link>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>History</h2>

        <div className="row" style={{ marginBottom: "1rem", gap: "0.5rem", flexWrap: "wrap" }}>
          {(["problems", "courses", "exercises", "exams"] as HistoryTab[]).map((t) => (
            <button
              key={t}
              type="button"
              className={tab === t ? "primary" : ""}
              onClick={() => setTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {items.length === 0 ? (
          <p className="muted">No {tab} yet.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {items.map((item) => (
              <li
                key={item.id}
                style={{
                  padding: "0.5rem 0",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                {renderItem(item)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
