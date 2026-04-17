import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../auth/AuthProvider";
import CountryPicker from "../components/CountryPicker";
import { getProfileFn, updateProfileFn } from "../lib/callables";
import type { UserProfile, UserRole } from "../lib/types";

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({ role: "student" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    getProfileFn({})
      .then(({ data }) => {
        if (data) setProfile(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await updateProfileFn(profile);
      setMessage({ type: "success", text: "Profile saved." });
    } catch (err) {
      setMessage({ type: "error", text: (err as Error).message });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Loading…</p>;

  return (
    <div>
      <form onSubmit={onSubmit} className="card">
        <h2 style={{ marginTop: 0 }}>Profile</h2>

        <div style={{ marginBottom: "1rem" }}>
          <label>Role</label>
          <div className="row" style={{ gap: "1rem" }}>
            {(["student", "professor"] as UserRole[]).map((r) => (
              <label key={r} style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer" }}>
                <input
                  type="radio"
                  name="role"
                  value={r}
                  checked={profile.role === r}
                  onChange={() => setProfile((p) => ({ ...p, role: r }))}
                  style={{ width: "auto" }}
                />
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </label>
            ))}
          </div>
        </div>

        <div className="row" style={{ marginBottom: "0.75rem", flexWrap: "wrap" }}>
          <div>
            <label>Default country</label>
            <CountryPicker
              value={profile.defaultCountry ?? "US"}
              onChange={(v) => setProfile((p) => ({ ...p, defaultCountry: v }))}
            />
          </div>
          <div>
            <label>Default grade / level</label>
            <input
              value={profile.defaultGradeLevel ?? ""}
              onChange={(e) =>
                setProfile((p) => ({ ...p, defaultGradeLevel: e.target.value || undefined }))
              }
              placeholder="e.g. Terminale, Grade 10"
            />
          </div>
          <div>
            <label>Preferred language</label>
            <input
              value={profile.preferredLanguage ?? ""}
              onChange={(e) =>
                setProfile((p) => ({ ...p, preferredLanguage: e.target.value || undefined }))
              }
              placeholder="e.g. fr, en, ar"
            />
          </div>
        </div>

        {message && (
          <p className={message.type === "error" ? "error" : "muted"}>
            {message.text}
          </p>
        )}

        <button type="submit" className="primary" disabled={saving}>
          {saving ? "Saving…" : "Save profile"}
        </button>
      </form>
    </div>
  );
}
