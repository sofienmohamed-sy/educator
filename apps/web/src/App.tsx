import { Navigate, Route, Routes, Link } from "react-router-dom";
import { useAuth } from "./auth/AuthProvider";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Solve from "./pages/Solve";

export default function App() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="app-shell">
        <p className="muted">Loading…</p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>
          <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>
            Σ mathresolver
          </Link>
        </h1>
        {user ? (
          <div className="row" style={{ gap: "0.75rem", flex: "0 0 auto" }}>
            <span className="muted">{user.email ?? user.uid}</span>
            <button onClick={() => void signOut()}>Sign out</button>
          </div>
        ) : null}
      </header>

      <Routes>
        {user ? (
          <>
            <Route path="/" element={<Home />} />
            <Route path="/solve" element={<Solve />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        )}
      </Routes>
    </div>
  );
}
