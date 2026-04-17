import { Navigate, Route, Routes, Link } from "react-router-dom";
import { useAuth } from "./auth/AuthProvider";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Solve from "./pages/Solve";
import Landing from "./pages/Landing";
import Profile from "./pages/Profile";
import Library from "./pages/Library";
import GenerateCourse from "./pages/GenerateCourse";
import GenerateExercises from "./pages/GenerateExercises";
import GenerateExam from "./pages/GenerateExam";

export default function App() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0a0a0f",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(255,255,255,0.4)",
          fontSize: "1rem",
        }}
      >
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/login"
          element={
            <div className="app-shell">
              <header className="app-header">
                <h1>
                  <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>
                    Σ sciresolver
                  </Link>
                </h1>
              </header>
              <Login />
            </div>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>
          <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>
            Σ sciresolver
          </Link>
        </h1>
        <div className="row" style={{ gap: "0.75rem", flex: "0 0 auto" }}>
          <Link to="/profile" style={{ fontSize: "0.85rem" }}>
            {user.email ?? user.uid}
          </Link>
          <button onClick={() => void signOut()}>Sign out</button>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/solve" element={<Solve />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/library" element={<Library />} />
        <Route path="/generate/course" element={<GenerateCourse />} />
        <Route path="/generate/exercises" element={<GenerateExercises />} />
        <Route path="/generate/exam" element={<GenerateExam />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
