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

interface ProblemDoc {
  id: string;
  country: string;
  createdAt?: Timestamp;
  solution?: { finalAnswer?: string; restatement?: string };
}

export default function Home() {
  const { user } = useAuth();
  const [problems, setProblems] = useState<ProblemDoc[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "users", user.uid, "problems"),
      orderBy("createdAt", "desc"),
      limit(20),
    );
    const unsub = onSnapshot(q, (snap) => {
      setProblems(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ProblemDoc, "id">) })),
      );
    });
    return unsub;
  }, [user]);

  return (
    <div>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Solve a new problem</h2>
        <p className="muted">
          Upload an image or PDF of your problem, or type it directly. Choose
          the country whose curriculum you want the explanation to follow.
        </p>
        <Link to="/solve">
          <button className="primary">New problem →</button>
        </Link>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>History</h2>
        {problems.length === 0 ? (
          <p className="muted">No problems solved yet.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {problems.map((p) => (
              <li key={p.id} style={{ padding: "0.5rem 0", borderBottom: "1px solid var(--border)" }}>
                <strong>{p.country}</strong> — {p.solution?.restatement ?? "(no restatement)"}
                <br />
                <span className="muted">→ {p.solution?.finalAnswer ?? ""}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
