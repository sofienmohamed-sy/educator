import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const PROBLEMS_PER_WEEK_DEFAULT = 10;
const MANUAL_MINUTES_PER_PROBLEM = 45;
const AI_MINUTES_PER_PROBLEM = 2;

function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    startRef.current = null;
    const animate = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return value;
}

function TimeCalculator() {
  const [problemsPerWeek, setProblemsPerWeek] = useState(PROBLEMS_PER_WEEK_DEFAULT);

  const manualHoursPerMonth = Math.round(
    (problemsPerWeek * MANUAL_MINUTES_PER_PROBLEM * 4) / 60,
  );
  const aiHoursPerMonth = Math.round(
    (problemsPerWeek * AI_MINUTES_PER_PROBLEM * 4) / 60,
  );
  const savedHoursPerMonth = manualHoursPerMonth - aiHoursPerMonth;
  const savedHoursPerYear = savedHoursPerMonth * 12;

  const displaySaved = useCountUp(savedHoursPerMonth);
  const displayYear = useCountUp(savedHoursPerYear);

  return (
    <section className="lp-calculator-section">
      <div className="lp-container">
        <div className="lp-section-label">Lead Magnet</div>
        <h2 className="lp-section-title">
          See How Much Time You're Leaving on the Table
        </h2>
        <p className="lp-section-sub">
          Move the slider to match your workload and watch the numbers speak for themselves.
        </p>

        <div className="lp-calc-card">
          <div className="lp-calc-top">
            <div className="lp-calc-slider-label">
              <span>Math problems per week</span>
              <span className="lp-calc-value">{problemsPerWeek}</span>
            </div>
            <input
              type="range"
              min={1}
              max={50}
              value={problemsPerWeek}
              onChange={(e) => setProblemsPerWeek(Number(e.target.value))}
              className="lp-slider"
            />
            <div className="lp-calc-ticks">
              <span>1</span><span>10</span><span>25</span><span>50</span>
            </div>
          </div>

          <div className="lp-calc-stats">
            <div className="lp-calc-stat lp-calc-manual">
              <div className="lp-calc-stat-icon">⏳</div>
              <div className="lp-calc-stat-number">{manualHoursPerMonth}h</div>
              <div className="lp-calc-stat-label">Spent manually / month</div>
            </div>

            <div className="lp-calc-arrow">→</div>

            <div className="lp-calc-stat lp-calc-ai">
              <div className="lp-calc-stat-icon">⚡</div>
              <div className="lp-calc-stat-number">{aiHoursPerMonth}h</div>
              <div className="lp-calc-stat-label">With Educator / month</div>
            </div>

            <div className="lp-calc-arrow">→</div>

            <div className="lp-calc-stat lp-calc-saved">
              <div className="lp-calc-stat-icon">🎯</div>
              <div className="lp-calc-stat-number lp-accent-number">{displaySaved}h</div>
              <div className="lp-calc-stat-label">Saved every month</div>
            </div>
          </div>

          <div className="lp-calc-year-banner">
            That's <strong>{displayYear} hours saved per year</strong> — time you can spend on deeper learning, not grinding through steps.
          </div>

          <div className="lp-calc-assumptions">
            * Based on 45 min average manual solving time vs. ~2 min with AI-guided step-by-step explanations.
          </div>
        </div>
      </div>
    </section>
  );
}

const steps = [
  {
    num: "01",
    title: "Upload your problem",
    desc: "Paste text, snap a photo, or drop a PDF. We handle handwriting, printed text, and complex notation.",
    icon: "📤",
  },
  {
    num: "02",
    title: "Choose your curriculum",
    desc: "Select your country's math curriculum so every explanation matches exactly what you're studying.",
    icon: "🌍",
  },
  {
    num: "03",
    title: "Get a clear solution",
    desc: "Receive a beautifully rendered, step-by-step breakdown with full reasoning — not just the answer.",
    icon: "✨",
  },
];

const features = [
  {
    icon: "🧠",
    title: "Claude AI at its core",
    desc: "Powered by Anthropic's Claude — one of the most capable reasoning models available today.",
  },
  {
    icon: "🌐",
    title: "Curriculum-aware",
    desc: "Solutions adapt to your national curriculum so you learn concepts in the exact way your teacher expects.",
  },
  {
    icon: "📐",
    title: "Beautiful math rendering",
    desc: "LaTeX-quality math notation rendered inline — every fraction, integral, and symbol is crisp and clear.",
  },
  {
    icon: "📸",
    title: "Image & PDF support",
    desc: "Upload photos of textbooks, worksheets, or handwritten notes. Our AI reads them all.",
  },
  {
    icon: "⚡",
    title: "Instant answers",
    desc: "Get comprehensive, step-by-step solutions in seconds, not hours of struggling alone.",
  },
  {
    icon: "🔒",
    title: "Private & secure",
    desc: "Your problems and solutions are stored securely under your account, accessible only to you.",
  },
];

const testimonials = [
  {
    name: "Aisha K.",
    role: "IB Math HL Student",
    quote: "I used to spend 2 hours on integration problems. Now I understand the concept in 10 minutes and can solve similar ones myself.",
    avatar: "A",
  },
  {
    name: "Marcus T.",
    role: "University Engineering Student",
    quote: "The curriculum filter is a game changer. It explains things exactly the way my professor does, not some different method I've never seen.",
    avatar: "M",
  },
  {
    name: "Priya S.",
    role: "High School Teacher",
    quote: "I recommend this to students who get stuck at home. It doesn't just give answers — it teaches them the reasoning behind each step.",
    avatar: "P",
  },
];

const mathExpressions = [
  "∫₀^∞ e^{-x²} dx = √π/2",
  "E = mc²",
  "∇² φ = 0",
  "∑ n² = n(n+1)(2n+1)/6",
  "lim_{x→0} sin(x)/x = 1",
  "det(A) = ad − bc",
  "Δ = b² − 4ac",
  "F = ma",
];

export default function Landing() {
  const [heroExpr, setHeroExpr] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setHeroExpr((n) => (n + 1) % mathExpressions.length);
    }, 2800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="lp-root">
      {/* NAV */}
      <nav className="lp-nav">
        <div className="lp-nav-inner">
          <div className="lp-logo">
            <span className="lp-logo-symbol">Σ</span> Educator
          </div>
          <div className="lp-nav-links">
            <a href="#how-it-works">How it works</a>
            <a href="#features">Features</a>
            <a href="#calculator">Time savings</a>
          </div>
          <Link to="/login" className="lp-nav-cta">Get started →</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="lp-hero">
        <div className="lp-hero-bg">
          {mathExpressions.map((expr, i) => (
            <div
              key={i}
              className={`lp-floating-expr lp-floating-expr-${i}`}
              aria-hidden="true"
            >
              {expr}
            </div>
          ))}
        </div>
        <div className="lp-container lp-hero-content">
          <div className="lp-badge">AI-Powered Math Tutor</div>
          <h1 className="lp-hero-title">
            Hard problems.
            <br />
            <span className="lp-gradient-text">Crystal clear</span>
            <br />
            solutions.
          </h1>
          <p className="lp-hero-sub">
            Stop struggling alone. Upload any math problem — image, PDF, or text — and get a step-by-step, curriculum-aligned explanation in seconds.
          </p>
          <div className="lp-hero-expr" key={heroExpr}>
            {mathExpressions[heroExpr]}
          </div>
          <div className="lp-hero-actions">
            <Link to="/login" className="lp-btn-primary">
              Solve your first problem free →
            </Link>
            <a href="#how-it-works" className="lp-btn-ghost">
              See how it works
            </a>
          </div>
          <div className="lp-hero-stats">
            <div className="lp-hero-stat">
              <strong>50+</strong> Curricula supported
            </div>
            <div className="lp-hero-stat-divider" />
            <div className="lp-hero-stat">
              <strong>2 min</strong> Average solve time
            </div>
            <div className="lp-hero-stat-divider" />
            <div className="lp-hero-stat">
              <strong>95%</strong> Student satisfaction
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="lp-how" id="how-it-works">
        <div className="lp-container">
          <div className="lp-section-label">How it works</div>
          <h2 className="lp-section-title">Three steps from problem to understanding</h2>
          <p className="lp-section-sub">
            No setup. No subscriptions required to try. Just results.
          </p>
          <div className="lp-steps">
            {steps.map((s) => (
              <div className="lp-step-card" key={s.num}>
                <div className="lp-step-num">{s.num}</div>
                <div className="lp-step-icon">{s.icon}</div>
                <h3 className="lp-step-title">{s.title}</h3>
                <p className="lp-step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEMO CARD */}
      <section className="lp-demo-section">
        <div className="lp-container">
          <div className="lp-demo-card">
            <div className="lp-demo-left">
              <div className="lp-demo-label">Problem</div>
              <div className="lp-demo-problem">
                Find all real solutions of the equation:
                <div className="lp-demo-math">x³ − 6x² + 11x − 6 = 0</div>
              </div>
            </div>
            <div className="lp-demo-arrow">⟶</div>
            <div className="lp-demo-right">
              <div className="lp-demo-label lp-demo-label-solution">Solution</div>
              <div className="lp-demo-steps-preview">
                <div className="lp-demo-step">
                  <span className="lp-demo-step-n">1</span>
                  <div>
                    <strong>Identify candidates</strong>
                    <div className="lp-demo-step-math">p/q ∈ &#123;±1, ±2, ±3, ±6&#125;</div>
                  </div>
                </div>
                <div className="lp-demo-step">
                  <span className="lp-demo-step-n">2</span>
                  <div>
                    <strong>Test x = 1</strong>
                    <div className="lp-demo-step-math">1 − 6 + 11 − 6 = 0 ✓</div>
                  </div>
                </div>
                <div className="lp-demo-step">
                  <span className="lp-demo-step-n">3</span>
                  <div>
                    <strong>Factor out (x − 1)</strong>
                    <div className="lp-demo-step-math">(x − 1)(x² − 5x + 6) = 0</div>
                  </div>
                </div>
                <div className="lp-demo-step">
                  <span className="lp-demo-step-n lp-step-final">✓</span>
                  <div>
                    <strong>Solutions</strong>
                    <div className="lp-demo-step-math lp-demo-answer">x = 1, 2, 3</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TIME CALCULATOR */}
      <div id="calculator">
        <TimeCalculator />
      </div>

      {/* FEATURES */}
      <section className="lp-features" id="features">
        <div className="lp-container">
          <div className="lp-section-label">Features</div>
          <h2 className="lp-section-title">Everything you need to master math</h2>
          <p className="lp-section-sub">
            Built for students, tutors, and educators who want genuine understanding — not just answers.
          </p>
          <div className="lp-features-grid">
            {features.map((f) => (
              <div className="lp-feature-card" key={f.title}>
                <div className="lp-feature-icon">{f.icon}</div>
                <h3 className="lp-feature-title">{f.title}</h3>
                <p className="lp-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="lp-testimonials">
        <div className="lp-container">
          <div className="lp-section-label">Testimonials</div>
          <h2 className="lp-section-title">What learners are saying</h2>
          <div className="lp-testimonials-grid">
            {testimonials.map((t) => (
              <div className="lp-testimonial-card" key={t.name}>
                <div className="lp-testimonial-quote">"</div>
                <p className="lp-testimonial-text">{t.quote}</p>
                <div className="lp-testimonial-author">
                  <div className="lp-testimonial-avatar">{t.avatar}</div>
                  <div>
                    <div className="lp-testimonial-name">{t.name}</div>
                    <div className="lp-testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="lp-cta">
        <div className="lp-container">
          <div className="lp-cta-card">
            <div className="lp-cta-glow" />
            <h2 className="lp-cta-title">
              Ready to stop struggling<br />and start understanding?
            </h2>
            <p className="lp-cta-sub">
              Join thousands of students turning confusion into clarity — in minutes.
            </p>
            <Link to="/login" className="lp-btn-primary lp-btn-large">
              Start solving for free →
            </Link>
            <p className="lp-cta-note">No credit card required. Works instantly.</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="lp-container lp-footer-inner">
          <div className="lp-logo lp-footer-logo">
            <span className="lp-logo-symbol">Σ</span> Educator
          </div>
          <p className="lp-footer-copy">
            © {new Date().getFullYear()} Educator. AI-powered scientific tutoring.
          </p>
        </div>
      </footer>
    </div>
  );
}
