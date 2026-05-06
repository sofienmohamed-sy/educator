import { useState, type FormEvent } from "react";
import CountryPicker from "../components/CountryPicker";
import GradeLevelPicker from "../components/GradeLevelPicker";
import SectionPicker from "../components/SectionPicker";
import SubjectPicker from "../components/SubjectPicker";
import TopicPicker from "../components/TopicPicker";
import { generateFicheFn } from "../lib/callables";
import { renderMarkdown } from "../lib/renderRichText";
import type { FichePedagogique, FicheSeance, Subject } from "../lib/types";

// ── Séance viewer ─────────────────────────────────────────────────────────────

function SeanceViewer({ seance }: { seance: FicheSeance }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div
      className="card"
      style={{ marginBottom: "1rem", border: "1px solid var(--border, #e5e7eb)" }}
    >
      <div
        style={{ cursor: "pointer", userSelect: "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}
        onClick={() => setExpanded((v) => !v)}
      >
        <h3 style={{ margin: 0 }}>
          Séance {seance.numero}{" "}
          <span className="muted" style={{ fontWeight: 400, fontSize: "0.9rem" }}>
            ({seance.duree})
          </span>
        </h3>
        <span>{expanded ? "▲" : "▼"}</span>
      </div>

      {expanded && (
        <div style={{ marginTop: "0.75rem" }}>
          {seance.aptitudes.length > 0 && (
            <div
              style={{
                background: "var(--bg-alt, #f8f9fa)",
                borderRadius: 4,
                padding: "0.5rem 0.75rem",
                marginBottom: "0.75rem",
              }}
            >
              <strong style={{ fontSize: "0.85rem" }}>Aptitudes à développer</strong>
              <ul style={{ margin: "0.25rem 0 0", paddingLeft: "1.25rem" }}>
                {seance.aptitudes.map((a, i) => (
                  <li key={i} style={{ fontSize: "0.9rem" }}>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {seance.paragraphes.map((par, pi) => (
            <div key={pi} style={{ marginBottom: "1rem" }}>
              <h4 style={{ margin: "0 0 0.4rem", color: "var(--accent, #2563eb)" }}>
                {par.titre}
              </h4>

              {par.demarche.length > 0 && (
                <div style={{ marginBottom: "0.4rem" }}>
                  <span className="muted" style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Démarche
                  </span>
                  <ol style={{ margin: "0.2rem 0 0", paddingLeft: "1.25rem", fontSize: "0.9rem" }}>
                    {par.demarche.map((d, di) => (
                      <li key={di}>{d}</li>
                    ))}
                  </ol>
                </div>
              )}

              <div style={{ lineHeight: 1.7, marginBottom: "0.5rem" }}>
                {renderMarkdown(par.contenu)}
              </div>

              {par.retenons && par.retenons.length > 0 && (
                <div
                  style={{
                    background: "var(--bg-yellow, #fffde7)",
                    border: "1px solid var(--border-yellow, #fde68a)",
                    borderLeft: "4px solid var(--accent-yellow, #d97706)",
                    borderRadius: "0 4px 4px 0",
                    padding: "0.5rem 0.75rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  {par.retenons.map((r, ri) => (
                    <div key={ri} style={{ fontSize: "0.9rem" }}>
                      {renderMarkdown(r)}
                    </div>
                  ))}
                </div>
              )}

              {par.applications && par.applications.length > 0 && (
                <div>
                  <span className="muted" style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Applications
                  </span>
                  <ol style={{ margin: "0.2rem 0 0", paddingLeft: "1.25rem", fontSize: "0.9rem" }}>
                    {par.applications.map((a, ai) => (
                      <li key={ai}>{a}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main viewer ───────────────────────────────────────────────────────────────

function FicheViewer({ fiche }: { fiche: FichePedagogique }) {
  return (
    <div>
      <div className="card">
        <h2 style={{ margin: "0 0 0.25rem" }}>{fiche.chapitre}</h2>
        <span className="muted">{fiche.niveau}</span>
      </div>

      {fiche.seances.map((s, i) => (
        <SeanceViewer key={i} seance={s} />
      ))}

      {fiche.serie && (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Série d'exercices — {fiche.serie.theme}</h3>
          {fiche.serie.exercices.map((ex, i) => (
            <div
              key={i}
              style={{
                marginBottom: "0.75rem",
                paddingBottom: "0.75rem",
                borderBottom: i < (fiche.serie?.exercices.length ?? 0) - 1
                  ? "1px solid var(--border, #e5e7eb)"
                  : "none",
              }}
            >
              <p style={{ margin: "0 0 0.25rem", fontWeight: 600 }}>
                Exercice {i + 1} — {ex.enonce}
              </p>
              {ex.questions.length > 0 && (
                <ol style={{ margin: 0, paddingLeft: "1.25rem", fontSize: "0.9rem" }}>
                  {ex.questions.map((q, qi) => (
                    <li key={qi}>{q}</li>
                  ))}
                </ol>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function GenerateFiche() {
  const [subject, setSubject] = useState<Subject>("math");
  const [topic, setTopic] = useState("");
  const [country, setCountry] = useState("TN");
  const [gradeLevel, setGradeLevel] = useState("");
  const [section, setSection] = useState("");
  const [language, setLanguage] = useState("");
  const [nbSeances, setNbSeances] = useState(2);

  const [fiche, setFiche] = useState<FichePedagogique | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!topic.trim()) return;
    setError(null);
    setFiche(null);
    setBusy(true);
    try {
      const { data } = await generateFicheFn({
        subject,
        topic: topic.trim(),
        country,
        gradeLevel: gradeLevel || undefined,
        section: section || undefined,
        language: language || undefined,
        nbSeances,
      });
      setFiche(data.fiche);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="card">
        <h2 style={{ marginTop: 0 }}>Générer une fiche pédagogique</h2>

        <div className="row" style={{ flexWrap: "wrap", marginBottom: "0.75rem" }}>
          <SubjectPicker value={subject} onChange={setSubject} />
          <div>
            <label>Pays / curriculum</label>
            <CountryPicker value={country} onChange={setCountry} />
          </div>
          <div>
            <label>Niveau (optionnel)</label>
            <GradeLevelPicker country={country} value={gradeLevel} onChange={setGradeLevel} />
          </div>
          <SectionPicker
            country={country}
            gradeLevel={gradeLevel}
            value={section}
            onChange={setSection}
          />
          <div>
            <label>Langue (optionnel)</label>
            <input
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              placeholder="fr, ar, en…"
            />
          </div>
        </div>

        <div style={{ marginBottom: "0.75rem" }}>
          <label>Chapitre / thème</label>
          <TopicPicker
            subject={subject}
            country={country}
            gradeLevel={gradeLevel}
            section={section}
            value={topic}
            onChange={setTopic}
            required
          />
        </div>

        <div style={{ marginBottom: "0.75rem" }}>
          <label>Nombre de séances ({nbSeances})</label>
          <input
            type="range"
            min={1}
            max={6}
            value={nbSeances}
            onChange={(e) => setNbSeances(Number(e.target.value))}
            style={{ width: "160px", display: "block" }}
          />
        </div>

        {error && <p className="error">{error}</p>}

        <button type="submit" className="primary" disabled={busy || !topic.trim()}>
          {busy ? "Génération en cours…" : "Générer la fiche"}
        </button>
      </form>

      {fiche && (
        <div style={{ marginTop: "1rem" }}>
          <FicheViewer fiche={fiche} />
        </div>
      )}
    </div>
  );
}
