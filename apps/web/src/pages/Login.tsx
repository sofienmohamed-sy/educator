import { useState, type FormEvent } from "react";
import { useAuth } from "../auth/AuthProvider";

export default function Login() {
  const { signInEmail, signUpEmail, signInGoogle } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signin") await signInEmail(email, password);
      else await signUpEmail(email, password);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 420, margin: "2rem auto" }}>
      <h2>{mode === "signin" ? "Sign in" : "Create an account"}</h2>
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: "0.75rem" }}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div style={{ marginBottom: "0.75rem" }}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            required
            minLength={6}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error ? <p className="error">{error}</p> : null}
        <button className="primary" type="submit" disabled={busy}>
          {mode === "signin" ? "Sign in" : "Sign up"}
        </button>
      </form>

      <div style={{ margin: "1rem 0", textAlign: "center" }} className="muted">
        or
      </div>

      <button
        onClick={() => {
          setError(null);
          void signInGoogle().catch((e) => setError((e as Error).message));
        }}
        style={{ width: "100%" }}
      >
        Continue with Google
      </button>

      <p className="muted" style={{ marginTop: "1rem", textAlign: "center" }}>
        {mode === "signin" ? "No account?" : "Already registered?"}{" "}
        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          style={{ padding: 0, border: "none", background: "none", color: "var(--accent)" }}
        >
          {mode === "signin" ? "Create one" : "Sign in"}
        </button>
      </p>
    </div>
  );
}
