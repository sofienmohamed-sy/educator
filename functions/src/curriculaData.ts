import type { CurriculumProfile, Subject } from "./schema";

/**
 * Static curriculum profiles for 16 countries × 4 subjects.
 *
 * Lookup key:
 *   "{COUNTRYCODE}_{subject}"  → subject-specific profile (preferred)
 *   "{COUNTRYCODE}"            → country-level fallback
 *
 * `getCurriculumProfile()` checks the static map first (zero-latency) before
 * falling back to a Firestore override at `curricula/{countryCode}`.
 */
export type ProfileData = Omit<CurriculumProfile, "countryCode">;

export const STATIC_CURRICULUM_PROFILES: Record<string, ProfileData> = {
  // ── FRANCE ────────────────────────────────────────────────────────────────
  "FR": {
    countryName: "France",
    defaultLanguage: "fr",
    decimalSeparator: "comma",
    intervalNotation: "french",
    proofCulture: "high",
    gradeLevels: ["Seconde", "Première", "Terminale"],
  },
  "FR_math": {
    countryName: "France",
    defaultLanguage: "fr",
    subject: "math",
    decimalSeparator: "comma",
    intervalNotation: "french",
    proofCulture: "high",
    logConvention: "ln_only",
    derivativeNotation: "prime",
    calculatorPolicy: "scientific",
    gradeLevels: ["Seconde", "Première", "Terminale"],
    notation:
      "Decimal separator: comma (2,5 not 2.5). Intervals: ]a,b[ for open, [a,b] for closed — NEVER (a,b) parentheses. Natural logarithm: ln only — never write log without a base. Derivatives: f'(x), f''(x) prime notation. Vectors: →u arrow above — NEVER bold. Sets: ℕ, ℤ, ℚ, ℝ, ℂ. Limits: lim_{x→+∞}.",
    conventions:
      "Proofs are standard in BAC Terminale — justify every step. L'Hôpital's rule is NOT in the Terminale Générale syllabus — never use it. Sequences (suites) are central. DL (développement limité) with o(x^n) notation. No matrices in current Terminale Générale syllabus.",
    stepStyle:
      "French academic style: 'Soit', 'On a', 'D'où', 'Donc', 'On en déduit que'. State named theorems before applying (TVI, Rolle). Conclude with 'Conclusion :'.",
    examFormat:
      "BAC Terminale: 3 hours, 20 points. Exercises with guided helper questions leading to a synthesis.",
    specialRules: [
      "Use ln only — never log without a base",
      "Intervals MUST use French notation: ]a,b[ for open endpoints",
      "Vectors MUST use arrow notation →u, never bold",
      "L'Hôpital's rule is NOT in the syllabus — forbidden",
    ],
  },
  "FR_physics": {
    countryName: "France",
    defaultLanguage: "fr",
    subject: "physics",
    gValue: 9.8,
    vectorNotation: "arrow_only",
    combinedPhysicsChem: true,
    formulaSheet: false,
    calculatorPolicy: "scientific",
    notation:
      "Vectors EXCLUSIVELY →F, →v, →a — NEVER bold. g = 9.8 m·s⁻² (NOT 10). SI units with dot multiplication: kg·m·s⁻². Loi d'Ohm: u = Ri.",
    conventions:
      "physique-chimie is a SINGLE combined subject (no separate physics exam). Special relativity NOT in 2019 Terminale Générale syllabus. Mechanics: Σ→F = m·→a with bilan des forces. Snell-Descartes law (not Snell's law). No formula sheet in BAC.",
    stepStyle:
      "Begin with bilan des forces (force inventory). Apply Newton's law in vector form. Conclude with 'Application numérique (A.N.)' for numerical computation.",
    specialRules: [
      "g = 9.8 m/s² unless explicitly specified otherwise",
      "Vectors MUST use arrow notation →F, never bold",
      "physique-chimie is a combined subject",
      "Special relativity is NOT in the 2019 Terminale Générale syllabus",
    ],
  },
  "FR_chemistry": {
    countryName: "France",
    defaultLanguage: "fr",
    subject: "chemistry",
    waterIonizationConstant: "Ke",
    concentrationUnit: "mol_per_L",
    arrowPushingMechanisms: true,
    combinedPhysicsChem: true,
    notation:
      "Water ionization constant: Ke = 10⁻¹⁴ at 25°C — NEVER use Kw. Concentrations: mol/L (mol·L⁻¹), never mol/dm³. pH = -log([H₃O⁺]) — use H₃O⁺ (oxonium), not H⁺. Arrow-pushing (mécanismes réactionnels) with curly arrows for electron pairs.",
    conventions:
      "physique-chimie combined subject. Arrow-pushing required for addition, substitution, acid-base. Henderson-Hasselbalch (relation de Henderson). Redox by méthode des demi-équations.",
    specialRules: [
      "Use Ke (not Kw) for water ionization constant",
      "Use H₃O⁺ (oxonium), never H⁺",
      "Arrow-pushing electron mechanisms are REQUIRED",
      "physique-chimie is combined",
    ],
  },
  "FR_informatics": {
    countryName: "France",
    defaultLanguage: "fr",
    subject: "informatics",
    notation:
      "NSI (Numérique et Sciences Informatiques) — Python 3 exclusively. Big-O: O(n), O(n²), O(log n) formally assessed. Invariant de boucle required. BFS, DFS, Dijkstra in syllabus. Bases binaire/hexadécimal, two's complement.",
    conventions:
      "NSI is a standalone Terminale subject. Big-O formally required and appears in BAC NSI exercises. Recursion, loop invariants, proof of termination examined. SQL (SELECT/FROM/WHERE/JOIN). TCP/IP networks. Python 3 syntax — DO NOT use Pascal.",
    specialRules: [
      "Python 3 exclusively — no Pascal, no C",
      "Big-O notation formally assessed",
      "Loop invariants and recursion are examined",
      "Graph algorithms (BFS, DFS, Dijkstra) are in the syllabus",
    ],
  },

  // ── MOROCCO ───────────────────────────────────────────────────────────────
  "MA": {
    countryName: "Morocco",
    defaultLanguage: "fr",
    decimalSeparator: "comma",
    intervalNotation: "french",
    proofCulture: "high",
    gradeLevels: ["1ère Bac", "2ème Bac"],
  },
  "MA_math": {
    countryName: "Morocco",
    defaultLanguage: "fr",
    subject: "math",
    decimalSeparator: "comma",
    intervalNotation: "french",
    proofCulture: "high",
    logConvention: "ln_only",
    derivativeNotation: "prime",
    gradeLevels: ["1ère Bac", "2ème Bac"],
    notation:
      "French notation: decimal comma, intervals ]a,b[, ln only, f'(x) prime notation, →u arrow vectors. Bilingual Arabic/French textbooks but notation is French.",
    conventions:
      "Moroccan BAC follows French curriculum closely. 2ème Bac covers suites, dérivation, intégration, probabilités. High proof culture.",
    examFormat:
      "BAC Maroc: 3 hours, 20 points, three exercises. Strong emphasis on sequences and calculus.",
    specialRules: [
      "Notation identical to French system: ]a,b[ intervals, ln only, comma decimal",
      "Respond in French unless Arabic is explicitly requested",
    ],
  },
  "MA_physics": {
    countryName: "Morocco",
    defaultLanguage: "fr",
    subject: "physics",
    gValue: 10,
    vectorNotation: "arrow_only",
    combinedPhysicsChem: true,
    formulaSheet: false,
    notation:
      "g = 10 m·s⁻² in Morocco (NOT 9.8 like France). Arrow vectors →F. Combined physique-chimie subject.",
    conventions:
      "Follows French physics curriculum but with g = 10. Bilan des forces. SI units. physique-chimie combined.",
    specialRules: [
      "CRITICAL: g = 10 m/s² (NOT 9.8 as in France) — this is the key Morocco/Tunisia difference",
      "Arrow notation for vectors (French style)",
      "physique-chimie is combined",
    ],
  },
  "MA_chemistry": {
    countryName: "Morocco",
    defaultLanguage: "fr",
    subject: "chemistry",
    waterIonizationConstant: "Ke",
    concentrationUnit: "mol_per_L",
    arrowPushingMechanisms: true,
    combinedPhysicsChem: true,
    notation:
      "Ke for water ionization constant (as in France). H₃O⁺ for hydronium. mol/L. French chemistry notation.",
    conventions:
      "Follows French chemistry curriculum. Ke = 10⁻¹⁴. Arrow-pushing required. Combined physique-chimie exam.",
    specialRules: [
      "Use Ke (not Kw) for water ionization constant",
      "Arrow-pushing mechanisms required",
    ],
  },
  "MA_informatics": {
    countryName: "Morocco",
    defaultLanguage: "fr",
    subject: "informatics",
    notation:
      "French pseudocode + Python. Basic algorithms. No formal Big-O.",
    conventions:
      "Less advanced than French NSI. Basic programming, data structure basics, simple algorithms. Python and French pseudocode (NOT Tunisian DEBUT/FIN style).",
    specialRules: [
      "Big-O NOT formally required (unlike France NSI)",
      "Use French pseudocode and Python",
      "Simpler algorithm coverage than French NSI",
    ],
  },

  // ── TUNISIA ───────────────────────────────────────────────────────────────
  "TN": {
    countryName: "Tunisia",
    defaultLanguage: "fr",
    decimalSeparator: "comma",
    proofCulture: "high",
    gradeLevels: ["1ère", "2ème", "3ème", "4ème (Bac)"],
  },
  "TN_math": {
    countryName: "Tunisia",
    defaultLanguage: "fr",
    subject: "math",
    decimalSeparator: "comma",
    intervalNotation: "french",
    proofCulture: "high",
    logConvention: "ln_only",
    derivativeNotation: "prime",
    gradeLevels: ["3ème", "4ème Secondaire (Bac)"],
    notation:
      "French notation: comma decimal, ]a,b[ intervals, ln only, f'(x) prime. Algèbre and Analyse domains.",
    conventions:
      "Tunisian BAC follows French system. High proof culture. 4ème Secondaire covers suites, intégration, probabilités, nombres complexes.",
    examFormat:
      "BAC Tunisie: 3 hours, 20 points, three exercises across analysis, algebra, statistics.",
    specialRules: [
      "French notation system: ]a,b[ intervals, ln only, comma decimal",
    ],
  },
  "TN_physics": {
    countryName: "Tunisia",
    defaultLanguage: "fr",
    subject: "physics",
    gValue: 10,
    vectorNotation: "arrow_only",
    combinedPhysicsChem: true,
    notation:
      "g = 10 m·s⁻² (like Morocco). Arrow vectors. physique-chimie combined.",
    conventions:
      "Follows French approach with g = 10. Combined physique-chimie subject.",
    specialRules: [
      "g = 10 m/s² (NOT 9.8) — like Morocco",
      "Arrow notation for vectors",
    ],
  },
  "TN_chemistry": {
    countryName: "Tunisia",
    defaultLanguage: "fr",
    subject: "chemistry",
    waterIonizationConstant: "Ke",
    concentrationUnit: "mol_per_L",
    arrowPushingMechanisms: true,
    combinedPhysicsChem: true,
    notation:
      "Ke for water ionization constant. mol/L. physique-chimie combined.",
    conventions:
      "Follows French chemistry curriculum. Ke = 10⁻¹⁴. Arrow-pushing required.",
    specialRules: [
      "Use Ke (not Kw)",
      "Arrow-pushing mechanisms required",
    ],
  },
  "TN_informatics": {
    countryName: "Tunisia",
    defaultLanguage: "fr",
    subject: "informatics",
    notation:
      "FORMAL PSEUDOCODE with Tunisian keywords: DEBUT/FIN block delimiters; SI/ALORS/SINON/FINSI conditionals; TANTQUE/FAIRE/FINTANTQUE while loops; POUR/ALLANT_DE/JUSQU'A/FAIRE/FINPOUR for-loops; TABLEAU for arrays; PROCEDURE / FONCTION for subprograms. Type declarations required: ENTIER, REEL, CHAINE, BOOLEEN. Pascal language alongside Python.",
    conventions:
      "CRITICAL: Tunisia uses a unique formal pseudocode (DEBUT/FIN/TANTQUE/FINSI) — completely different from French NSI Python style. Pascal still taught alongside Python. Top-down algorithm design. No Big-O in standard curriculum.",
    specialRules: [
      "CRITICAL: Use Tunisian pseudocode (DEBUT/FIN/TANTQUE/FINSI) — NOT Python-style pseudocode",
      "Pascal may be expected alongside Python",
      "DIFFERENT from France NSI — do not apply French conventions",
      "Type declarations are REQUIRED in pseudocode",
    ],
  },

  // ── UNITED STATES ─────────────────────────────────────────────────────────
  "US": {
    countryName: "United States",
    defaultLanguage: "en",
    decimalSeparator: "dot",
    intervalNotation: "standard",
    proofCulture: "medium",
    gradeLevels: ["Grade 9", "Grade 10", "Grade 11", "Grade 12"],
  },
  "US_math": {
    countryName: "United States",
    defaultLanguage: "en",
    subject: "math",
    decimalSeparator: "dot",
    intervalNotation: "standard",
    proofCulture: "medium",
    logConvention: "log_base10",
    derivativeNotation: "both",
    calculatorPolicy: "graphing",
    gradeLevels: ["Algebra I", "Geometry", "Algebra II/Precalculus", "AP Calculus AB/BC"],
    notation:
      "Decimal point. Intervals (a,b) open / [a,b] closed. log without base = log₁₀. ln for natural log. Both f'(x) and dy/dx (Leibniz preferred in AP Calculus). Vectors: bold **v** or arrow.",
    conventions:
      "AP Calculus AB: limits, derivatives, integrals (single variable). BC adds series, parametric, polar. Graphing calculator (TI-84) expected. FTC central. u-substitution, integration by parts. Common Core for grades 9-11 before AP track.",
    examFormat:
      "AP Calculus AB/BC: 3h15 with calculator section. SAT Math: no calculus. ACT Math: precalculus.",
    specialRules: [
      "log without base means log₁₀ (NOT natural log)",
      "Graphing calculator expected in AP Calculus",
      "Interval notation uses parentheses (a,b), not ]a,b[",
    ],
  },
  "US_physics": {
    countryName: "United States",
    defaultLanguage: "en",
    subject: "physics",
    gValue: 9.8,
    vectorNotation: "bold",
    formulaSheet: true,
    calculatorPolicy: "graphing",
    notation:
      "g = 9.8 m/s² (or 10 in simplified problems). Vectors: bold **F** or arrow. Formula sheet provided in AP Physics.",
    conventions:
      "AP Physics 1/2 (algebra-based) and AP Physics C (calculus-based: Mechanics, E&M). Formula sheet in exam. Special relativity NOT in AP Physics 1/2. Graphing calculator permitted.",
    specialRules: [
      "Formula sheet PROVIDED in AP Physics exams",
      "Special relativity NOT in AP Physics 1/2 standard curriculum",
    ],
  },
  "US_chemistry": {
    countryName: "United States",
    defaultLanguage: "en",
    subject: "chemistry",
    waterIonizationConstant: "Kw",
    concentrationUnit: "mol_per_L",
    arrowPushingMechanisms: false,
    notation:
      "Kw = 1.0 × 10⁻¹⁴ at 25°C. Concentrations in mol/L (M). No arrow-pushing in AP Chemistry.",
    conventions:
      "AP Chemistry: thermodynamics (ΔG, ΔH, ΔS) full treatment. Reaction type classification (SN1/SN2 labels without arrow mechanisms). Electrochemistry. Reference sheet provided.",
    specialRules: [
      "Use Kw (not Ke) for water ionization constant",
      "Arrow-pushing mechanisms NOT required in AP Chemistry",
      "Reference sheet provided in AP Chemistry exam",
    ],
  },
  "US_informatics": {
    countryName: "United States",
    defaultLanguage: "en",
    subject: "informatics",
    notation:
      "AP Computer Science A: Java. AP CS Principles: Python or pseudocode.",
    conventions:
      "AP CS A (Java): classes, inheritance, ArrayLists, 2D arrays, recursion. No formal Big-O. AP CS Principles: cross-language concepts, algorithms, data, internet, cybersecurity.",
    specialRules: [
      "AP CS A uses Java (not Python)",
      "Formal Big-O analysis not required in AP CS A",
    ],
  },

  // ── UNITED KINGDOM ────────────────────────────────────────────────────────
  "GB": {
    countryName: "United Kingdom",
    defaultLanguage: "en",
    decimalSeparator: "dot",
    intervalNotation: "standard",
    proofCulture: "high",
    gradeLevels: ["GCSE", "A-level (AS/A2)"],
  },
  "GB_math": {
    countryName: "United Kingdom",
    defaultLanguage: "en",
    subject: "math",
    decimalSeparator: "dot",
    intervalNotation: "standard",
    proofCulture: "high",
    logConvention: "both",
    derivativeNotation: "both",
    calculatorPolicy: "scientific",
    gradeLevels: ["GCSE", "AS-level", "A-level"],
    notation:
      "Decimal point. (a,b) open / [a,b] closed. log without base = log₁₀, ln for natural. Both f'(x) and dy/dx. ẋ Newton dot in mechanics. Vectors: bold **a** in print, underlined a̲ in handwriting. Surds preferred (√2 not 1.414...).",
    conventions:
      "A-level Maths: Core Pure, Statistics, Mechanics. Further Maths: complex numbers, matrices, ODEs, hyperbolic functions. Formal proofs required (induction, contradiction). Formula booklet provided.",
    examFormat:
      "A-level: 2-3 papers, calculator and non-calculator sections. GCSE: 3 papers (1 non-calc, 2 calc).",
    specialRules: [
      "Formal proof IS required and assessed (induction, contradiction)",
      "Formula booklet provided in exams",
      "Newton dot notation (ẋ) used for time derivatives in mechanics",
    ],
  },
  "GB_physics": {
    countryName: "United Kingdom",
    defaultLanguage: "en",
    subject: "physics",
    gValue: 9.81,
    vectorNotation: "bold",
    formulaSheet: true,
    calculatorPolicy: "scientific",
    notation:
      "g = 9.81 m/s² in A-level (NOT 9.8 or 10). Vectors: bold. Formula booklet provided.",
    conventions:
      "A-level Physics includes special relativity (Edexcel, AQA). Moments, circular motion, SHM, electric fields, electromagnetism, nuclear physics. Formula booklet in all exams.",
    specialRules: [
      "g = 9.81 m/s² (NOT 9.8 or 10) for A-level",
      "Formula booklet PROVIDED in A-level Physics",
      "Special relativity IS in A-level Physics syllabus",
    ],
  },
  "GB_chemistry": {
    countryName: "United Kingdom",
    defaultLanguage: "en",
    subject: "chemistry",
    waterIonizationConstant: "Kw",
    concentrationUnit: "mol_per_dm3",
    arrowPushingMechanisms: true,
    notation:
      "Kw = 1.0 × 10⁻¹⁴ mol² dm⁻⁶ at 25°C. CRITICAL: concentration in mol dm⁻³ (NOT mol/L). Curly arrow mechanisms required for ALL named reactions. Standard electrode potential E° in volts. ΔG° = ΔH° - TΔS°.",
    conventions:
      "A-level Chemistry has the most rigorous arrow-pushing: SN1, SN2, E1, E2, addition, aromatic substitution. Definitions of enthalpy/entropy must be precise word-for-word. Kc (concentration), Kp (pressure), Ka.",
    specialRules: [
      "CRITICAL: mol dm⁻³ NOT mol/L for concentrations",
      "Use Kw (not Ke)",
      "Full curly arrow mechanisms required for ALL organic reactions",
      "Most rigorous arrow-pushing of all assessed countries",
    ],
  },
  "GB_informatics": {
    countryName: "United Kingdom",
    defaultLanguage: "en",
    subject: "informatics",
    notation:
      "A-level CS: Python and pseudocode. Big-O notation formally assessed. SQL, networks, OOP, Boolean algebra, finite state machines.",
    conventions:
      "OCR/AQA A-level CS: recursion, sorting/searching with Big-O analysis, logic gates, FSMs, SQL, TCP/IP. Python primary; pseudocode in exams.",
    specialRules: [
      "Big-O notation formally assessed in A-level CS",
      "Python primary; pseudocode used in exams",
    ],
  },

  // ── GERMANY ───────────────────────────────────────────────────────────────
  "DE": {
    countryName: "Germany",
    defaultLanguage: "de",
    decimalSeparator: "comma",
    proofCulture: "high",
    gradeLevels: ["Klasse 10", "Klasse 11", "Klasse 12", "Abitur"],
  },
  "DE_math": {
    countryName: "Germany",
    defaultLanguage: "de",
    subject: "math",
    decimalSeparator: "comma",
    intervalNotation: "standard",
    proofCulture: "high",
    logConvention: "both",
    derivativeNotation: "both",
    calculatorPolicy: "graphing",
    notation:
      "Decimal comma (2,5). [a,b] or (a,b) — varies by Land. ln for natural, log for log₁₀. Both f'(x) and dy/dx. ẋ for time derivatives. Column vectors with arrow notation →v.",
    conventions:
      "Zentralabitur in most states. Formal Beweise (proofs) required. CAS calculator (TI-Nspire) required in some Länder. Stochastik major. Analytische Geometrie (3D vectors) replaces calculus emphasis in some states.",
    examFormat:
      "Abitur: 4-5 hour exam with CAS. Three areas: Analysis (calculus), Analytische Geometrie, Stochastik.",
    specialRules: [
      "Decimal comma required: 2,5 not 2.5",
      "CAS calculator may be required in some German Länder Abitur",
    ],
  },
  "DE_physics": {
    countryName: "Germany",
    defaultLanguage: "de",
    subject: "physics",
    gValue: 9.81,
    vectorNotation: "both",
    formulaSheet: true,
    notation:
      "g = 9,81 m/s² (comma decimal). Formelsammlung (formula collection) provided. Vectors: both bold and arrow. SI strictly.",
    conventions:
      "Physik Abitur includes Spezielle Relativitätstheorie (special relativity) in most Länder. Quantum basics. Elektromagnetismus, Mechanik, Schwingungen und Wellen. Formelsammlung provided.",
    specialRules: [
      "g = 9,81 m/s² (comma decimal)",
      "Special relativity IS in the Abitur Physics syllabus",
      "Formula collection (Formelsammlung) provided",
    ],
  },
  "DE_chemistry": {
    countryName: "Germany",
    defaultLanguage: "de",
    subject: "chemistry",
    waterIonizationConstant: "Kw",
    concentrationUnit: "mol_per_L",
    arrowPushingMechanisms: true,
    notation:
      "Kw. mol/L. Arrow mechanisms (Reaktionsmechanismen) in organic chemistry.",
    conventions:
      "Chemie Abitur: Organische Chemie with mechanisms, Elektrochemie, Säure-Base, Gleichgewicht. Full ΔG/ΔH/ΔS treatment.",
    specialRules: [
      "Arrow-pushing mechanisms required for Abitur organic chemistry",
    ],
  },
  "DE_informatics": {
    countryName: "Germany",
    defaultLanguage: "de",
    subject: "informatics",
    notation:
      "Java and/or Python. Informatik as separate Abitur subject. OOP, databases, formal languages (Automaten).",
    conventions:
      "Abitur Informatik: OOP, algorithms with complexity analysis, relational databases (SQL), formal languages (Chomsky hierarchy, finite automata), networking. Big-O discussed.",
    specialRules: [
      "Java commonly used alongside Python",
      "Formal languages (Automaten) is a major topic unique to Germany",
    ],
  },

  // ── ITALY ─────────────────────────────────────────────────────────────────
  "IT": {
    countryName: "Italy",
    defaultLanguage: "it",
    decimalSeparator: "comma",
    proofCulture: "high",
    gradeLevels: ["3ª", "4ª", "5ª Liceo Scientifico"],
  },
  "IT_math": {
    countryName: "Italy",
    defaultLanguage: "it",
    subject: "math",
    decimalSeparator: "comma",
    intervalNotation: "standard",
    proofCulture: "high",
    logConvention: "both",
    derivativeNotation: "prime",
    notation:
      "Decimal comma. f'(x) prime notation. log for log₁₀, ln for natural. Intervals: (a,b) or ]a,b[ both seen.",
    conventions:
      "Liceo Scientifico: Analisi Matematica, Geometria Analitica, Probabilità. High proof culture — theorems must be proved (Weierstrass, Lagrange, Rolle, De L'Hôpital). De L'Hôpital's rule IS in syllabus (unlike France).",
    examFormat:
      "Maturità Liceo Scientifico: 6-hour written exam, 2 problems with guided sub-questions.",
    specialRules: [
      "De L'Hôpital's rule IS in Italian Liceo Scientifico (unlike France)",
      "High proof culture: theorems must be stated and proved",
      "Decimal comma required",
    ],
  },
  "IT_physics": {
    countryName: "Italy",
    defaultLanguage: "it",
    subject: "physics",
    gValue: 9.81,
    vectorNotation: "both",
    formulaSheet: false,
    notation:
      "g = 9,81 m/s². Special relativity (Relatività Ristretta) IS in Liceo Scientifico 5ª.",
    conventions:
      "Special relativity included in Liceo Scientifico (unlike France). No formula sheet in Maturità. Meccanica, Termodinamica, Elettromagnetismo, Relatività, Fisica Moderna.",
    specialRules: [
      "Special relativity IS in Liceo Scientifico (5ª year)",
      "g = 9.81 m/s²",
      "No formula sheet in Maturità",
    ],
  },
  "IT_chemistry": {
    countryName: "Italy",
    defaultLanguage: "it",
    subject: "chemistry",
    waterIonizationConstant: "Kw",
    concentrationUnit: "mol_per_L",
    arrowPushingMechanisms: false,
    notation: "Kw. mol/L. Minimal arrow-pushing in standard Liceo curriculum.",
    conventions:
      "Chimica Liceo: qualitative focus. Equilibrio, pH, Redox. ΔG/ΔH qualitative. Functional groups and naming, but not rigorous arrow-pushing.",
    specialRules: [
      "Arrow-pushing NOT typically required in standard Italian curriculum",
    ],
  },
  "IT_informatics": {
    countryName: "Italy",
    defaultLanguage: "it",
    subject: "informatics",
    notation: "Liceo Scientifico Informatica: minimal. Python, basic algorithms.",
    conventions:
      "Standard Liceo Scientifico has minimal informatics. Istituto Tecnico Informatica: Java/C, databases, networking.",
    specialRules: [
      "Minimal informatics in standard Liceo Scientifico",
    ],
  },

  // ── SPAIN ─────────────────────────────────────────────────────────────────
  "ES": {
    countryName: "Spain",
    defaultLanguage: "es",
    decimalSeparator: "comma",
    intervalNotation: "standard",
    proofCulture: "medium",
    gradeLevels: ["1º Bachillerato", "2º Bachillerato"],
  },
  "ES_math": {
    countryName: "Spain",
    defaultLanguage: "es",
    subject: "math",
    decimalSeparator: "comma",
    proofCulture: "medium",
    logConvention: "both",
    derivativeNotation: "prime",
    notation:
      "Decimal comma. f'(x). log for log₁₀, ln for natural. Intervals: (a,b) standard.",
    conventions:
      "EVAU (selectividad) for 2º Bachillerato. Analysis, linear algebra, probability. Medium proof culture. Scientific calculator allowed.",
    examFormat:
      "EVAU: 90-minute exam, choose 4 of 6 questions. Calculator allowed.",
    specialRules: [
      "Calculator allowed in EVAU",
      "Medium proof culture — less rigorous than France",
      "Decimal comma",
    ],
  },
  "ES_physics": {
    countryName: "Spain",
    defaultLanguage: "es",
    subject: "physics",
    gValue: 9.8,
    vectorNotation: "both",
    formulaSheet: true,
    notation: "g = 9,8 m/s². Formula sheet provided. Special relativity IS in 2º Bachillerato.",
    conventions:
      "Física 2º Bachillerato: Mecánica, Ondas, Óptica, Electromagnetismo, Física Moderna (Relatividad, Quantum intro).",
    specialRules: [
      "Special relativity IS in 2º Bachillerato",
      "Formula sheet provided",
    ],
  },
  "ES_chemistry": {
    countryName: "Spain",
    defaultLanguage: "es",
    subject: "chemistry",
    waterIonizationConstant: "Kw",
    concentrationUnit: "mol_per_L",
    arrowPushingMechanisms: false,
    notation: "Kw. mol/L. No arrow-pushing in EVAU.",
    conventions:
      "Química 2º Bachillerato: Estequiometría, Equilibrio químico, Termoquímica, Ácidos/bases, Redox, Química orgánica (naming/functional groups).",
    specialRules: [
      "Arrow-pushing NOT required in standard Spanish curriculum",
    ],
  },
  "ES_informatics": {
    countryName: "Spain",
    defaultLanguage: "es",
    subject: "informatics",
    notation: "Python and pseudocode. Basic algorithms.",
    conventions:
      "TIC (Tecnología de la Información) in Bachillerato. Basic programming, databases, networks. Python increasingly used.",
    specialRules: [
      "No formal Big-O in standard Spanish curriculum",
    ],
  },

  // ── EGYPT ─────────────────────────────────────────────────────────────────
  "EG": {
    countryName: "Egypt",
    defaultLanguage: "ar",
    decimalSeparator: "dot",
    gradeLevels: ["Grade 10", "Grade 11", "Grade 12 (Thanaweya Amma)"],
  },
  "EG_math": {
    countryName: "Egypt",
    defaultLanguage: "ar",
    subject: "math",
    decimalSeparator: "dot",
    proofCulture: "medium",
    logConvention: "both",
    notation:
      "Arabic instruction. Decimal point. International notation. log for log₁₀, ln for natural. Calculus in Thanaweya Amma (Grade 12).",
    conventions:
      "Egyptian curriculum: Thanaweya Amma. Algebra, calculus basics, statistics. STEM schools more advanced. Arabic-medium with international notation.",
    gradeLevels: ["Grade 10", "Grade 11", "Grade 12"],
    examFormat:
      "Thanaweya Amma: written exam. STEM diploma: more advanced, project-based.",
    specialRules: [
      "Arabic-medium instruction by default",
      "International notation despite Arabic medium",
    ],
  },
  "EG_physics": {
    countryName: "Egypt",
    defaultLanguage: "ar",
    subject: "physics",
    gValue: 9.8,
    vectorNotation: "both",
    notation: "g = 9.8 m/s². Standard physics notation. Arabic instruction.",
    conventions:
      "Mechanics, Waves, Thermodynamics, Electricity, Magnetism, Optics, Modern Physics basics. Limited special relativity.",
    specialRules: ["Arabic-medium instruction"],
  },
  "EG_chemistry": {
    countryName: "Egypt",
    defaultLanguage: "ar",
    subject: "chemistry",
    waterIonizationConstant: "Kw",
    concentrationUnit: "mol_per_L",
    arrowPushingMechanisms: false,
    notation: "Kw. mol/L. Arabic instruction.",
    conventions:
      "Stoichiometry, acid-base, redox, organic naming. Limited arrow-pushing. ΔG/ΔS absent in standard curriculum.",
    specialRules: [
      "Arabic-medium instruction",
      "Arrow-pushing NOT in standard curriculum",
    ],
  },
  "EG_informatics": {
    countryName: "Egypt",
    defaultLanguage: "ar",
    subject: "informatics",
    notation: "STEM schools: Python/Java. Standard curriculum: limited CS.",
    conventions:
      "Standard Egyptian curriculum has minimal informatics. STEM schools: Python, data structures, algorithms.",
    specialRules: [
      "Limited informatics in standard curriculum",
      "Arabic-medium instruction",
    ],
  },

  // ── INDIA ─────────────────────────────────────────────────────────────────
  "IN": {
    countryName: "India",
    defaultLanguage: "en",
    decimalSeparator: "dot",
    proofCulture: "medium",
    gradeLevels: ["Class 11", "Class 12 (CBSE/NCERT)"],
  },
  "IN_math": {
    countryName: "India",
    defaultLanguage: "en",
    subject: "math",
    decimalSeparator: "dot",
    proofCulture: "medium",
    logConvention: "both",
    derivativeNotation: "both",
    calculatorPolicy: "forbidden",
    gradeLevels: ["Class 11", "Class 12"],
    notation:
      "Decimal point. CBSE/NCERT notation. log for log₁₀, ln for natural. dy/dx Leibniz primary; f'(x) also used. Matrices/determinants major Class 12 topic. NO calculator in any board/JEE exam.",
    conventions:
      "CBSE Class 12: Relations & Functions, Inverse Trigonometry, Matrices, Determinants, Calculus (derivatives, integrals, ODEs), Vectors & 3D, Linear Programming, Probability. JEE: highly competitive.",
    examFormat:
      "CBSE Class 12 Board: 3 hours, 80 marks. JEE Main/Advanced: MCQ + numerical, no calculator.",
    specialRules: [
      "NO calculator permitted in any exam",
      "Matrices and determinants are major Class 12 topic (unlike France)",
      "JEE requires deeper problem-solving than board exams",
    ],
  },
  "IN_physics": {
    countryName: "India",
    defaultLanguage: "en",
    subject: "physics",
    gValue: 9.8,
    vectorNotation: "both",
    formulaSheet: false,
    calculatorPolicy: "forbidden",
    notation: "g = 9.8 m/s² (sometimes 10 in JEE simplified). No calculator. No formula sheet.",
    conventions:
      "CBSE/JEE Physics: Mechanics, Thermal, Oscillations, Waves, Electrostatics, Current Electricity, Magnetic effects, EMI, AC, Optics, Modern Physics (photoelectric, de Broglie, nuclear).",
    specialRules: [
      "NO calculator in any exam",
      "No formula sheet — formulas memorized",
      "g = 9.8 m/s² (JEE sometimes uses 10 for convenience)",
    ],
  },
  "IN_chemistry": {
    countryName: "India",
    defaultLanguage: "en",
    subject: "chemistry",
    waterIonizationConstant: "Kw",
    concentrationUnit: "mol_per_L",
    arrowPushingMechanisms: true,
    calculatorPolicy: "forbidden",
    notation:
      "Kw. mol/L. Arrow-pushing required for SN1/SN2/E1/E2/addition in CBSE Class 12 and JEE.",
    conventions:
      "CBSE/JEE Organic Chemistry: arrow-pushing for SN1/SN2/E1/E2/addition. Named reactions (Aldol, Cannizzaro, Grignard) memorized. No calculator.",
    specialRules: [
      "Arrow-pushing mechanisms ARE required in CBSE/JEE",
      "Named reactions (Aldol, Cannizzaro, Grignard) must be known",
      "No calculator in any exam",
    ],
  },
  "IN_informatics": {
    countryName: "India",
    defaultLanguage: "en",
    subject: "informatics",
    notation: "CBSE Class 12 CS: Python (post-2017). Earlier: C++. Data structures, SQL, networking.",
    conventions:
      "CBSE CS: Python 3, data structures (stacks, queues, lists), sorting (bubble, insertion, selection), SQL (DDL, DML, joins), networking (TCP/IP). Time complexity discussed but not Big-O formal.",
    specialRules: [
      "Python 3 standard (post-2017 CBSE revision)",
      "Formal Big-O not required in CBSE board exam",
    ],
  },

  // ── CHINA ─────────────────────────────────────────────────────────────────
  "CN": {
    countryName: "China",
    defaultLanguage: "zh",
    decimalSeparator: "dot",
    proofCulture: "medium",
    gradeLevels: ["高一 (Grade 10)", "高二 (Grade 11)", "高三 (Grade 12, Gaokao)"],
  },
  "CN_math": {
    countryName: "China",
    defaultLanguage: "zh",
    subject: "math",
    decimalSeparator: "dot",
    proofCulture: "medium",
    logConvention: "both",
    derivativeNotation: "prime",
    calculatorPolicy: "forbidden",
    notation: "Decimal point. f'(x). log_a(x) notation. ln for natural. No calculator in Gaokao.",
    conventions:
      "Gaokao mathematics: functions, sequences, derivatives (basic, no integration emphasis), solid geometry, analytic geometry, probability/statistics. Calculus limited — focus on derivatives, not integrals.",
    examFormat: "Gaokao Math: 150 minutes, 150 points. MCQ + fill-in-blank + free response.",
    specialRules: [
      "NO calculator in Gaokao",
      "Integration is minimal in standard Gaokao (derivatives are main calculus content)",
      "Chinese instruction by default",
    ],
  },
  "CN_physics": {
    countryName: "China",
    defaultLanguage: "zh",
    subject: "physics",
    gValue: 9.8,
    vectorNotation: "both",
    formulaSheet: false,
    calculatorPolicy: "forbidden",
    notation: "g = 9.8 m/s² (or 10 simplified). No calculator. No formula sheet. Chinese instruction.",
    conventions:
      "Gaokao Physics: Mechanics, Thermal, Electrostatics, Circuits, Magnetism, EMI, Waves, Optics, Modern Physics. All formulas memorized.",
    specialRules: [
      "NO calculator in Gaokao",
      "No formula sheet",
      "Chinese instruction",
    ],
  },
  "CN_chemistry": {
    countryName: "China",
    defaultLanguage: "zh",
    subject: "chemistry",
    waterIonizationConstant: "Kw",
    concentrationUnit: "mol_per_L",
    arrowPushingMechanisms: false,
    calculatorPolicy: "forbidden",
    notation: "Kw. mol/L. No arrow-pushing in Gaokao. Chinese instruction.",
    conventions:
      "Gaokao Chemistry: Stoichiometry, Periodic table, Bonding, Reaction rates, Equilibrium, Electrochemistry, Organic (functional groups, no arrow mechanisms).",
    specialRules: [
      "No arrow-pushing mechanisms in Gaokao chemistry",
      "NO calculator",
      "Chinese instruction",
    ],
  },
  "CN_informatics": {
    countryName: "China",
    defaultLanguage: "zh",
    subject: "informatics",
    notation: "Python (since 2017 reform). NOIP: C++ for competition.",
    conventions:
      "信息技术 standard curriculum: Python basics, algorithms, data structures, databases, networks. NOIP: C++ competitive. No formal Big-O in standard.",
    specialRules: [
      "Python in standard curriculum; C++ for competitive programming",
      "Chinese instruction",
      "No formal Big-O in standard curriculum",
    ],
  },

  // ── JAPAN ─────────────────────────────────────────────────────────────────
  "JP": {
    countryName: "Japan",
    defaultLanguage: "ja",
    decimalSeparator: "dot",
    proofCulture: "medium",
    gradeLevels: ["高1 (Grade 10)", "高2 (Grade 11)", "高3 (Grade 12, 共通テスト)"],
  },
  "JP_math": {
    countryName: "Japan",
    defaultLanguage: "ja",
    subject: "math",
    decimalSeparator: "dot",
    proofCulture: "medium",
    logConvention: "both",
    derivativeNotation: "prime",
    calculatorPolicy: "forbidden",
    notation: "Decimal point. f'(x). log for log₁₀, ln for natural. No calculator in 共通テスト.",
    conventions:
      "数学I/II/III/A/B/C. 数学III (science track): derivatives, integrals, limits. 数学B: sequences, vectors. Mathematical induction proofs required.",
    examFormat: "共通テスト: MCQ, 70 min/session. 大学入試 (univ entrance): free response, no calculator.",
    specialRules: [
      "NO calculator in common entrance tests",
      "Mathematical induction proofs required",
      "Japanese instruction by default",
    ],
  },
  "JP_physics": {
    countryName: "Japan",
    defaultLanguage: "ja",
    subject: "physics",
    gValue: 9.8,
    vectorNotation: "both",
    formulaSheet: false,
    calculatorPolicy: "forbidden",
    notation: "g = 9.8 m/s² (or 9.80). No calculator. No formula sheet.",
    conventions:
      "物理: Mechanics, Waves, Thermal, Electromagnetism, Modern Physics. Limited special relativity in standard curriculum.",
    specialRules: [
      "NO calculator in standard exams",
      "Japanese instruction",
    ],
  },
  "JP_chemistry": {
    countryName: "Japan",
    defaultLanguage: "ja",
    subject: "chemistry",
    waterIonizationConstant: "Kw",
    concentrationUnit: "mol_per_L",
    arrowPushingMechanisms: false,
    calculatorPolicy: "forbidden",
    notation: "Kw. mol/L. No arrow-pushing in standard 化学.",
    conventions:
      "化学: Atomic structure, bonding, stoichiometry, kinetics, equilibrium, electrochemistry, organic (functional groups, no arrow mechanisms).",
    specialRules: [
      "Arrow-pushing NOT in standard Japanese curriculum",
      "NO calculator",
      "Japanese instruction",
    ],
  },
  "JP_informatics": {
    countryName: "Japan",
    defaultLanguage: "ja",
    subject: "informatics",
    notation: "情報I (mandatory since 2022): Python. Basic algorithms, data, networks, cybersecurity.",
    conventions:
      "情報I now mandatory for all high school students. Python primary. Basic data structures, sorting, searching, binary representation. No formal Big-O.",
    specialRules: [
      "Python used in 情報I (mandatory since 2022)",
      "Japanese instruction",
      "No formal Big-O",
    ],
  },

  // ── SOUTH KOREA ───────────────────────────────────────────────────────────
  "KR": {
    countryName: "South Korea",
    defaultLanguage: "ko",
    decimalSeparator: "dot",
    proofCulture: "medium",
    gradeLevels: ["고1 (Grade 10)", "고2 (Grade 11)", "고3 (Grade 12, 수능)"],
  },
  "KR_math": {
    countryName: "South Korea",
    defaultLanguage: "ko",
    subject: "math",
    decimalSeparator: "dot",
    proofCulture: "medium",
    logConvention: "both",
    derivativeNotation: "prime",
    calculatorPolicy: "forbidden",
    notation: "Decimal point. f'(x). log for log₁₀, ln for natural. No calculator in 수능 (CSAT).",
    conventions:
      "수능 수학: sequences, limits, derivatives, integrals, probability/statistics. Known for extremely difficult math problems requiring creative thinking.",
    examFormat: "수능 Math: 100 minutes, 30 questions (21 MCQ + 9 short answer). No calculator.",
    specialRules: [
      "NO calculator in 수능",
      "Korean instruction",
      "Very high problem difficulty — creative non-routine problems expected",
    ],
  },
  "KR_physics": {
    countryName: "South Korea",
    defaultLanguage: "ko",
    subject: "physics",
    gValue: 9.8,
    vectorNotation: "both",
    formulaSheet: false,
    calculatorPolicy: "forbidden",
    notation: "g = 9.8 m/s². No calculator in 수능. Korean instruction.",
    conventions:
      "Physics I/II: Mechanics, Waves, Thermodynamics, Electromagnetism, Modern Physics. Special relativity in Physics II.",
    specialRules: [
      "NO calculator in 수능",
      "Korean instruction",
    ],
  },
  "KR_chemistry": {
    countryName: "South Korea",
    defaultLanguage: "ko",
    subject: "chemistry",
    waterIonizationConstant: "Kw",
    concentrationUnit: "mol_per_L",
    arrowPushingMechanisms: false,
    calculatorPolicy: "forbidden",
    notation: "Kw. mol/L. No arrow-pushing. Korean instruction.",
    conventions:
      "Chemistry I/II: atomic structure, bonding, stoichiometry, equilibrium, acids/bases, redox, organic naming. No arrow-pushing.",
    specialRules: [
      "No arrow-pushing in Korean chemistry",
      "NO calculator",
      "Korean instruction",
    ],
  },
  "KR_informatics": {
    countryName: "South Korea",
    defaultLanguage: "ko",
    subject: "informatics",
    notation: "Python (2015 revision). 정보 (Informatics) subject. KOI uses C++.",
    conventions:
      "정보: Python, basic algorithms (sorting, searching), data representation, networks. Korean Informatics Olympiad (KOI): C++.",
    specialRules: [
      "Python in standard curriculum",
      "Korean instruction",
      "No formal Big-O",
    ],
  },

  // ── BRAZIL ────────────────────────────────────────────────────────────────
  "BR": {
    countryName: "Brazil",
    defaultLanguage: "pt",
    decimalSeparator: "comma",
    proofCulture: "low",
    gradeLevels: ["1º ano EM", "2º ano EM", "3º ano EM (ENEM)"],
  },
  "BR_math": {
    countryName: "Brazil",
    defaultLanguage: "pt",
    subject: "math",
    decimalSeparator: "comma",
    proofCulture: "low",
    logConvention: "log_base10",
    calculatorPolicy: "forbidden",
    notation: "Decimal comma (2,5). log for log₁₀. ln rarely used at secondary level. No calculator in ENEM.",
    conventions:
      "CRITICAL: NO calculus in standard Brazilian secondary curriculum (ENEM focus). Covers arithmetic, algebra, geometry, statistics, basic functions (linear, quadratic, exponential, logarithm), probability. No derivatives, no integrals in ENEM.",
    examFormat: "ENEM: 45 questions multiple choice, 5.5 hours combined with Portuguese.",
    specialRules: [
      "CRITICAL: NO calculus (derivatives/integrals) in standard ENEM curriculum",
      "Decimal comma required",
      "No calculator in ENEM",
      "log means log₁₀",
    ],
  },
  "BR_physics": {
    countryName: "Brazil",
    defaultLanguage: "pt",
    subject: "physics",
    gValue: 10,
    vectorNotation: "both",
    formulaSheet: false,
    calculatorPolicy: "forbidden",
    notation: "g = 10 m/s² in most ENEM problems. Portuguese instruction. No calculator.",
    conventions:
      "ENEM Physics: conceptual focus over computation. Mechanics, Energy, Waves, Optics, Thermodynamics, Electricity, Magnetism basics. Multiple choice.",
    specialRules: [
      "g = 10 m/s² used in ENEM (simplified)",
      "Conceptual understanding emphasized over calculation",
      "Portuguese instruction",
    ],
  },
  "BR_chemistry": {
    countryName: "Brazil",
    defaultLanguage: "pt",
    subject: "chemistry",
    waterIonizationConstant: "Kw",
    concentrationUnit: "mol_per_L",
    arrowPushingMechanisms: false,
    notation: "Kw. mol/L. No arrow-pushing. Portuguese instruction.",
    conventions:
      "ENEM Chemistry: contextual approach (everyday applications). Stoichiometry, acid-base qualitative, redox basics, organic naming. No arrow mechanisms. No formal ΔG/ΔS.",
    specialRules: [
      "Arrow-pushing NOT in ENEM chemistry",
      "Contextual/applied approach",
      "Portuguese instruction",
    ],
  },
  "BR_informatics": {
    countryName: "Brazil",
    defaultLanguage: "pt",
    subject: "informatics",
    notation: "Minimal in ENEM curriculum. OBI: C/C++/Python.",
    conventions:
      "Standard Brazilian secondary has minimal CS. OBI competitive: C/C++. Some schools offer Python basics. ENEM does not assess programming.",
    specialRules: [
      "Programming NOT in standard ENEM curriculum",
      "Portuguese instruction",
    ],
  },

  // ── CANADA ────────────────────────────────────────────────────────────────
  "CA": {
    countryName: "Canada",
    defaultLanguage: "en",
    decimalSeparator: "dot",
    intervalNotation: "standard",
    proofCulture: "medium",
    gradeLevels: ["Grade 11", "Grade 12"],
    notes: "Quebec uses French system (similar to France). Other provinces: English Canadian curriculum.",
  },
  "CA_math": {
    countryName: "Canada",
    defaultLanguage: "en",
    subject: "math",
    decimalSeparator: "dot",
    intervalNotation: "standard",
    proofCulture: "medium",
    logConvention: "both",
    derivativeNotation: "both",
    calculatorPolicy: "graphing",
    notation: "Decimal point (English provinces). Intervals (a,b). log for log₁₀, ln for natural. Both f'(x) and dy/dx. Graphing calculator allowed.",
    conventions:
      "Ontario Grade 12: MCV4U (Calculus and Vectors), MHF4U (Advanced Functions), MDM4U (Data Management). BC Math 12, Alberta Math 30-1 follow similar pattern. Quebec uses French curriculum.",
    examFormat:
      "Provincial exams vary: Ontario (school-based), BC (provincial Foundations/Pre-Calc), Alberta (Diploma exams).",
    specialRules: [
      "Quebec uses French system — apply French conventions for Quebec students",
      "Graphing calculator permitted in English Canadian provinces",
    ],
  },
  "CA_physics": {
    countryName: "Canada",
    defaultLanguage: "en",
    subject: "physics",
    gValue: 9.8,
    vectorNotation: "both",
    formulaSheet: true,
    calculatorPolicy: "graphing",
    notation: "g = 9.8 m/s². Formula sheets in provincial exams. Special relativity in some provinces.",
    conventions:
      "Ontario SPH4U: special relativity included. BC, Alberta: special relativity in Grade 12 Physics. Formula sheet provided.",
    specialRules: [
      "Special relativity IS in most Canadian provincial Grade 12 Physics",
      "Formula sheet provided",
    ],
  },
  "CA_chemistry": {
    countryName: "Canada",
    defaultLanguage: "en",
    subject: "chemistry",
    waterIonizationConstant: "Kw",
    concentrationUnit: "mol_per_L",
    arrowPushingMechanisms: true,
    notation: "Kw. mol/L. Arrow-pushing required in Ontario Grade 12 Chemistry (SCH4U).",
    conventions:
      "Ontario SCH4U: organic chemistry with SN1/SN2 arrow mechanisms. Full thermodynamics (ΔG, ΔH, ΔS). Electrochemistry. Formula sheet provided.",
    specialRules: [
      "Arrow-pushing mechanisms REQUIRED in Ontario Grade 12 Chemistry",
      "Full thermodynamics treatment",
    ],
  },
  "CA_informatics": {
    countryName: "Canada",
    defaultLanguage: "en",
    subject: "informatics",
    notation: "Python (ICS courses), Java (AP CS). Ontario: ICS3U/ICS4U.",
    conventions:
      "Ontario ICS: Python, OOP, algorithms. Big-O discussed informally. Waterloo CEMC competitions: advanced problem-solving.",
    specialRules: [
      "Python primary language for ICS courses",
      "Formal Big-O not required in standard curriculum",
    ],
  },

  // ── AUSTRALIA ─────────────────────────────────────────────────────────────
  "AU": {
    countryName: "Australia",
    defaultLanguage: "en",
    decimalSeparator: "dot",
    intervalNotation: "standard",
    proofCulture: "medium",
    gradeLevels: ["Year 11", "Year 12 (ATAR)"],
  },
  "AU_math": {
    countryName: "Australia",
    defaultLanguage: "en",
    subject: "math",
    decimalSeparator: "dot",
    intervalNotation: "standard",
    proofCulture: "medium",
    logConvention: "both",
    derivativeNotation: "both",
    calculatorPolicy: "graphing",
    notation: "Decimal point. (a,b) intervals. log₁₀ and ln. f'(x) and dy/dx. CAS/graphing calculator allowed in ATAR.",
    conventions:
      "ATAR: VCE (Victoria), HSC (NSW), QCE (Queensland), WACE (WA). Mathematical Methods (calculus) and Specialist Mathematics (higher level). Proofs required in Specialist Math.",
    examFormat: "ATAR: 2-3 exams (calculator-free + calculator sections).",
    specialRules: [
      "CAS calculator allowed in ATAR exams",
      "Proofs required in Specialist Mathematics",
    ],
  },
  "AU_physics": {
    countryName: "Australia",
    defaultLanguage: "en",
    subject: "physics",
    gValue: 9.8,
    vectorNotation: "both",
    formulaSheet: true,
    calculatorPolicy: "graphing",
    notation: "g = 9.8 m/s². Formula sheet provided. Special relativity in most state curricula.",
    conventions:
      "VCE Physics, HSC Physics: special relativity (time dilation, length contraction). Particle physics basics. Quantum basics. Formula sheet provided.",
    specialRules: [
      "Special relativity IS in most Australian state Physics curricula",
      "Formula sheet provided",
    ],
  },
  "AU_chemistry": {
    countryName: "Australia",
    defaultLanguage: "en",
    subject: "chemistry",
    waterIonizationConstant: "Kw",
    concentrationUnit: "mol_per_L",
    arrowPushingMechanisms: true,
    notation: "Kw. mol/L. Arrow-pushing required in ATAR Chemistry (VCE, HSC).",
    conventions:
      "VCE/HSC Chemistry: organic with arrow mechanisms (addition, substitution). Full thermodynamics (ΔG, ΔH, ΔS). Electrochemistry. Data book provided.",
    specialRules: [
      "Arrow-pushing mechanisms REQUIRED in ATAR Chemistry",
      "Data book provided",
    ],
  },
  "AU_informatics": {
    countryName: "Australia",
    defaultLanguage: "en",
    subject: "informatics",
    notation: "Python. VCE Algorithmics (Victoria): formal Big-O, advanced data structures.",
    conventions:
      "VCE Algorithmics (unique to Victoria): formal Big-O, NP-completeness, dynamic programming, advanced graph algorithms. Other states: more basic CS.",
    specialRules: [
      "Victoria's Algorithmics has formal Big-O — most rigorous in Australia",
      "Other states: standard Python and basic algorithms",
    ],
  },
};

/**
 * Section / track / filière overlays.
 *
 * Lookup key (most specific wins):
 *   "{COUNTRY}_{LEVEL}_{SECTION}_{subject}"  → section + subject specific
 *   "{COUNTRY}_{LEVEL}_{SECTION}"            → section level (any subject)
 *
 * The overlay is merged onto the base country (or country_subject) profile.
 * Single-value fields override; text fields are appended after the base text;
 * array fields (specialRules, referenceBooks) are concatenated.
 */
export const STATIC_SECTION_PROFILES: Record<string, Partial<ProfileData>> = {
  // ── France · Terminale · Spécialité Maths ────────────────────────────────
  "FR_Terminale_Spécialité Maths_math": {
    notation:
      "Section Spécialité Maths (BAC Général). Toutes les conventions FR maths s'appliquent (virgule décimale, ]a,b[, ln, →u, ℝ).",
    conventions:
      "Programme officiel BO spécial n°8 du 25 juillet 2019. Quatre blocs : (1) Algèbre & géométrie — combinatoire et dénombrement, vecteurs/droites/plans de l'espace, orthogonalité et distances dans l'espace, produit scalaire dans l'espace, représentations paramétriques, équations cartésiennes ; (2) Analyse — suites (limites, raisonnement par récurrence, suites monotones, théorème de convergence monotone, théorème des gendarmes), limites de fonctions, compléments sur la dérivation (composition, dérivée seconde), continuité (TVI et corollaire avec stricte monotonie), fonction logarithme népérien, fonctions sinus/cosinus, primitives, équations différentielles y'=ay et y'=ay+b, calcul intégral ; (3) Probabilités — variables aléatoires, espérance, variance, loi binomiale (déjà 1ère), inégalité de Bienaymé-Tchebychev, loi (faible) des grands nombres, concentration ; (4) Algorithmique & programmation — Python.",
    stepStyle:
      "Récurrence est LE schéma de preuve central — initialisation, hérédité, conclusion. Pour le TVI : énoncer le théorème, vérifier continuité et changement de signe (ou stricte monotonie), conclure. Pour les limites : utiliser opérations sur limites, gendarmes, ou comparaison.",
    examFormat:
      "Épreuve de spécialité (mars de Terminale dans l'ancien calendrier ; en juin depuis 2024) : 4 heures, 20 points, coefficient 16. 3 à 5 exercices indépendants notés 4 à 8 points. Calculatrice graphique autorisée mais souvent non décisive.",
    referenceBooks: [
      "Hyperbole Terminale Spécialité (Nathan)",
      "Barbazo Terminale Spécialité (Hachette)",
      "Indice Terminale Spécialité (Bordas)",
      "Déclic Terminale Spécialité (Hachette)",
    ],
    specialRules: [
      "Pas de matrices au programme — supprimées en 2019",
      "Pas de nombres complexes — déplacés en option Maths Expertes",
      "Pas d'arithmétique (PGCD, congruences) — déplacée en option Maths Expertes",
      "Équations différentielles limitées à y'=ay et y'=ay+b (pas de second membre général)",
      "Toujours justifier l'existence et l'unicité avec TVI + stricte monotonie",
      "Récurrence obligatoire pour toute propriété indexée par n ∈ ℕ",
    ],
    notes:
      "L'épreuve écrite teste systématiquement : un exercice probabilités, un sur les suites/récurrence, un sur fonction (étude complète : limites, dérivée, variations, équation), un sur géométrie dans l'espace.",
  },

  // ── France · Terminale · Maths Expertes (option, 3h/sem) ─────────────────
  "FR_Terminale_Maths Expertes (option)_math": {
    notation:
      "Option Maths Expertes (3h/sem) — RÉSERVÉE aux élèves qui suivent ALSO la Spécialité Maths. Public : visant CPGE / Maths Sup / écoles d'ingénieurs / classes prépas scientifiques.",
    conventions:
      "Programme BO spécial n°8 du 25 juillet 2019. Trois thèmes uniquement : (1) Nombres complexes — point de vue algébrique (forme algébrique a+ib, conjugué, module, argument) ET géométrique (image d'un complexe, affixe, transformations du plan : translations, rotations, homothéties, similitudes), forme exponentielle e^{iθ}, équations dans ℂ, racines n-ièmes de l'unité, racines carrées, équations du 2nd degré à coefficients réels ou complexes ; (2) Arithmétique — divisibilité dans ℤ, division euclidienne, congruences (arithmétique modulaire), PGCD, théorème de Bézout, théorème de Gauss, nombres premiers (infinité, théorème fondamental), petit théorème de Fermat ; (3) Graphes et matrices — matrices (somme, produit, puissances, inverses pour 2×2 et 3×3), graphes orientés et non orientés, matrice d'adjacence, chaînes de Markov (vecteur de probabilité, distribution stationnaire).",
    stepStyle:
      "Pour les complexes : préciser l'écriture utilisée (algébrique, trigonométrique, exponentielle) avant de calculer ; justifier le passage entre formes. Pour l'arithmétique : invoquer Bézout, Gauss, ou Fermat par leur nom. Pour les chaînes de Markov : matrice de transition explicite, état stationnaire πM = π.",
    examFormat:
      "Pas d'épreuve écrite séparée pour l'option — la note est intégrée dans le bulletin (contrôle continu). Visée principale : préparer aux concours et CPGE.",
    referenceBooks: [
      "Maths Expertes Terminale (Hachette)",
      "Maths Expertes Terminale (Nathan)",
      "Maths Expertes Terminale (Bordas)",
    ],
    specialRules: [
      "Forme exponentielle e^{iθ} obligatoire dès qu'on travaille en module/argument",
      "Pour les congruences, invoquer les théorèmes par leur nom (Bézout, Gauss, Fermat, Wilson)",
      "Matrices uniquement de tailles 2×2 ou 3×3 — pas de cas général n×n",
      "Chaînes de Markov à nombre fini d'états seulement",
      "Élève suit en parallèle Spé Maths : peut utiliser tout le programme de Spé sans le redémontrer",
    ],
  },

  // ── France · Terminale · Maths Complémentaires (option, 3h/sem) ──────────
  "FR_Terminale_Maths Complémentaires (option)_math": {
    notation:
      "Option Maths Complémentaires (3h/sem) — pour élèves ayant ABANDONNÉ la spécialité maths après la Première mais ayant besoin de bases mathématiques en post-bac (médecine, économie, sciences sociales, IUT, BUT, écoles de commerce post-bac).",
    conventions:
      "Programme BO spécial n°8 du 25 juillet 2019. Reprend et approfondit la Première : (1) Analyse — fonctions de référence (exponentielle, logarithme népérien), continuité, dérivation et compléments (composée, dérivée seconde, convexité, points d'inflexion), limites de fonctions, primitives, calcul intégral, équations différentielles simples y'=ay+b ; (2) Probabilités et statistiques — variables aléatoires (loi, espérance, variance), loi binomiale, échantillonnage, intervalles de fluctuation/confiance ; (3) Algorithmique — implémentations Python simples.",
    stepStyle:
      "Approche plus appliquée que la spécialité : insister sur l'interprétation (taux de variation, croissance/décroissance, sens concret de l'intégrale comme aire), moins sur la rigueur des preuves. Le raisonnement par récurrence n'est PAS au programme.",
    examFormat:
      "Pas d'épreuve écrite — note de contrôle continu uniquement.",
    referenceBooks: [
      "Maths Complémentaires Terminale (Hachette)",
      "Maths Complémentaires Terminale (Nathan)",
      "Maths Complémentaires Terminale (Bordas)",
    ],
    specialRules: [
      "PAS de raisonnement par récurrence (réservé à la spécialité)",
      "PAS de géométrie dans l'espace — supprimée du programme Compl",
      "PAS de combinatoire/dénombrement avancé — supprimée",
      "PAS de suites compliquées — limites de suites étudiées sans formalisme ε",
      "Approche orientée applications (modèles économiques, biologiques, sociaux)",
      "L'élève n'a PAS suivi la spécialité maths en Terminale — n'utiliser que des outils de Première",
    ],
  },

  // ── France · Terminale · Spécialité Physique-Chimie (6h/sem) ─────────────
  "FR_Terminale_Spécialité Physique-Chimie_physics": {
    notation:
      "Section Spécialité Physique-Chimie (BAC Général, 6h/sem). g = 9,8 m·s⁻² (souvent arrondi à 10 dans les exercices). Vecteurs avec flèche →. Concentrations en mol·L⁻¹.",
    conventions:
      "Programme BO spécial n°8 du 25 juillet 2019. Quatre thèmes : (1) Constitution et transformations de la matière — structure des entités chimiques, modélisation des transformations (acide-base, oxydoréduction), évolution temporelle (cinétique, vitesse de réaction, loi de vitesse), équilibres chimiques (Q_r vs K), titrages avec suivi pH ou conductimétrique, chimie organique (formules topologiques, familles fonctionnelles, mécanismes par flèches courbes — substitution nucléophile, addition, élimination), polymères ; (2) Mouvement et interactions — 2ᵉ loi de Newton, mouvement dans des champs uniformes (poids, électrique), mouvements de satellites (Kepler), pendule, oscillations ; (3) L'énergie : conversions et transferts — premier principe, énergie interne, capacité thermique, transferts thermiques (conduction, convection, rayonnement), bilan énergétique, rendement ; (4) Ondes et signaux — modèle ondulatoire, lunette astronomique, lentilles, diffraction et interférences, effet Doppler, dispositifs optiques, modèles ondulatoire et particulaire de la lumière (photon, énergie hν).",
    stepStyle:
      "Toujours commencer par : système, référentiel, bilan des forces, schéma. Pour la cinétique : tracer ln(C) ou 1/C selon l'ordre. Pour la chimie : tableau d'avancement, équation bilan, calcul de la quantité limitante. Mécanismes organiques : flèches courbes (mouvement de doublets), pas de symboles « → » pour les déplacements d'électrons.",
    examFormat:
      "BAC : 3h30, 16 points (en juin de Terminale depuis 2024). 2 à 3 exercices, dont au moins une analyse documentaire et une expérimentation. Calculatrice autorisée. Formulaire FOURNI (pas d'apprentissage par cœur des formules secondaires).",
    referenceBooks: [
      "Bordas Physique-Chimie Terminale Spécialité",
      "Hachette Physique-Chimie Terminale Spécialité",
      "Nathan Physique-Chimie Terminale Spécialité",
      "Hatier Physique-Chimie Terminale Spécialité",
    ],
    specialRules: [
      "Toujours préciser système + référentiel avant tout bilan de forces",
      "Mécanismes réactionnels : utiliser EXCLUSIVEMENT les flèches courbes (doublets d'électrons)",
      "Concentrations en mol·L⁻¹ — jamais mol/dm³ ni g/L sans conversion",
      "g = 9,8 m·s⁻² (parfois 9,81 ou 10 selon la précision demandée)",
      "Formulaire fourni en examen — utiliser exactement les notations du formulaire officiel",
      "Pour les titrages, identifier l'équivalence par changement de pente (volume V_E)",
    ],
  },

  // ── France · Terminale · Spécialité SVT (6h/sem) ─────────────────────────
  "FR_Terminale_Spécialité SVT_chemistry": {
    notation:
      "Section Spécialité SVT (Sciences de la Vie et de la Terre, 6h/sem). Bien que classée chimie ici (proximité disciplinaire), la SVT couvre biologie, géologie et écologie — utiliser le vocabulaire scientifique français standard.",
    conventions:
      "Programme BO spécial n°8 du 25 juillet 2019. Trois grands thèmes : (1) La Terre, la vie et l'organisation du vivant — génétique et évolution (stabilité du génome lors de la mitose, brassage génétique lors de la méiose et fécondation, mutations, sélection naturelle, dérive génétique, coévolution, spéciation), géologie (dynamique interne de la Terre : tectonique des plaques, magmatisme, géothermie) ; (2) Les enjeux contemporains de la planète — climats du passé (paléoclimats, isotopes ¹⁸O/¹⁶O, cycle du carbone), réchauffement actuel et conséquences, écosystèmes et services écosystémiques ; (3) Le corps humain et la santé — comportements, mouvement et système nerveux, glycémie et diabète, immunité (innée, adaptative, vaccination, anticorps).",
    stepStyle:
      "Approche scientifique exigée : observation → hypothèse → expérience → résultat → interprétation → conclusion. Justifier chaque affirmation par un document, une expérience historique ou un mécanisme biologique précis.",
    examFormat:
      "BAC : 3h30, 16 points. 2 exercices : (1) restitution organisée de connaissances avec documents ; (2) raisonnement scientifique. Au moins un exercice doit porter sur Terre/vie/organisation, l'autre alterne entre enjeux planétaires et corps humain.",
    referenceBooks: [
      "Bordas SVT Terminale Spécialité",
      "Belin SVT Terminale Spécialité",
      "Nathan SVT Terminale Spécialité",
      "Hatier SVT Terminale Spécialité",
    ],
    specialRules: [
      "Vocabulaire précis : ne pas confondre « gène »/« allèle », « caryotype »/« génotype », « espèce »/« population »",
      "Toujours faire référence aux mécanismes moléculaires (ADN, ARN, protéines) quand pertinent",
      "Pour le climat : citer les proxies (isotopes, foraminifères, pollens) et les échelles de temps appropriées",
      "Pour l'immunité : distinguer innée vs adaptative, primaire vs secondaire",
    ],
  },

  // ── Maroc · 2ème Bac · Sciences Mathématiques A ──────────────────────────
  "MA_2ème Bac_Sciences Mathématiques A_math": {
    notation:
      "Filière Sciences Mathématiques A (SM A) — la filière la plus exigeante en mathématiques au Maroc, parallèle à SM B mais avec SVT au lieu de Sciences de l'Ingénieur. Conventions FR maths (virgule décimale, ]a,b[, ln). g = 10 m·s⁻² en physique.",
    conventions:
      "Programme officiel du Ministère de l'Éducation (BIOF — Baccalauréat International Option Français). Couverture exhaustive : (1) Limites et continuité (théorème des valeurs intermédiaires, théorème de Bolzano, prolongement par continuité) ; (2) Dérivabilité, étude de fonctions, théorème de Rolle, théorème des accroissements finis (TAF) ; (3) Suites numériques (récurrentes, monotones, adjacentes, théorème de la convergence monotone) ; (4) Fonctions logarithme népérien et exponentielle ; (5) Équations différentielles du premier ordre y'+ay=b et second ordre y''+ay'+by=0 ; (6) Nombres complexes (deux parties — algébrique/exponentielle et applications géométriques : transformations, équations) ; (7) Primitives et calcul intégral (intégration par parties, changement de variable) ; (8) Arithmétique (divisibilité, division euclidienne, congruences, PGCD/PPCM, théorème de Bézout, théorème de Gauss, nombres premiers, théorème de Fermat) ; (9) Structures algébriques (lois de composition internes, groupes, anneaux, corps) ; (10) Espaces vectoriels (sous-espaces, bases, dimension, applications linéaires) ; (11) Probabilités (variables aléatoires, lois discrètes).",
    stepStyle:
      "Style très formel, proche des classes préparatoires françaises. Définitions rigoureuses, démonstrations attendues, structures algébriques abordées de manière abstraite. Pour les structures : vérifier les axiomes (associativité, élément neutre, symétrique, distributivité). Pour l'arithmétique : citer les théorèmes par leur nom.",
    examFormat:
      "Examen national : 4 heures, coefficient 9 (le plus élevé). 4 exercices indépendants couvrant analyse, algèbre, arithmétique/structures, complexes. Calculatrice non programmable autorisée.",
    referenceBooks: [
      "Maths 2 Bac SM A (Al Madariss / Dar Errachad)",
      "Etincelle Maths 2 Bac SM",
      "Le compagnon en Mathématiques 2BAC SM",
      "Manuels Xriadiat",
    ],
    specialRules: [
      "Niveau le plus haut au Maroc — comparable à la spécialité maths FR + l'option Maths Expertes",
      "Structures algébriques (groupes, anneaux, corps) sont AU programme — démontrer en partant des axiomes",
      "Espaces vectoriels formels — bases, dimension, noyau/image d'application linéaire",
      "Équations différentielles d'ordre 2 à coefficients constants AU programme",
      "Toujours invoquer Rolle, TAF, Bézout, Gauss, Fermat par leur nom",
      "Justifier la convergence avant de calculer une limite ou intégrale impropre",
    ],
  },

  // ── Maroc · 2ème Bac · Sciences Mathématiques B ──────────────────────────
  "MA_2ème Bac_Sciences Mathématiques B_math": {
    notation:
      "Filière Sciences Mathématiques B (SM B) — programme de mathématiques IDENTIQUE à SM A ; la différence porte sur la matière secondaire (Sciences de l'Ingénieur en SM B au lieu de SVT en SM A). Conventions FR maths.",
    conventions:
      "Programme officiel BIOF identique à SM A : limites/continuité, dérivabilité (Rolle, TAF), suites, ln/exp, équations différentielles 1er et 2nd ordre, nombres complexes (algébriques + géométriques), primitives/calcul intégral, arithmétique (Bézout, Gauss, Fermat), structures algébriques (groupes, anneaux, corps), espaces vectoriels, probabilités.",
    stepStyle:
      "Identique à SM A — style formel, démonstrations rigoureuses. La différence avec SM A se voit surtout dans les exercices contextualisés (SI/ingénierie en SM B vs biologie/SVT en SM A) mais le programme math reste le même.",
    examFormat:
      "Examen national : 4 heures, coefficient 9. Sujet identique ou très similaire à SM A — souvent même épreuve.",
    referenceBooks: [
      "Maths 2 Bac SM B (Al Madariss)",
      "Etincelle Maths 2 Bac SM",
      "Manuels Xriadiat",
    ],
    specialRules: [
      "Programme math IDENTIQUE à SM A — mêmes outils, mêmes exigences",
      "Élève suit Sciences de l'Ingénieur (SI) en parallèle — s'attendre à des exercices applicatifs ingénierie",
      "Structures algébriques + espaces vectoriels formels au programme",
      "Équations différentielles d'ordre 2 à coefficients constants au programme",
    ],
  },

  // ── Maroc · 2ème Bac · Sciences Physiques (PC) — math view ───────────────
  "MA_2ème Bac_Sciences Physiques (PC)_math": {
    notation:
      "Filière Sciences Physiques (PC, BIOF) — niveau math intermédiaire (entre SM et SVT). Conventions FR maths (virgule, ]a,b[, ln).",
    conventions:
      "Programme math 2 Bac PC : limites/continuité, dérivabilité, étude de fonctions, suites, ln/exp, primitives et calcul intégral, équations différentielles simples (y'+ay=b), nombres complexes (algébrique + module/argument + applications géométriques), arithmétique de base (divisibilité, congruences, PGCD), probabilités. PAS de structures algébriques abstraites, PAS d'espaces vectoriels formels, PAS de Rolle/TAF formellement.",
    stepStyle:
      "Approche moins formelle que SM — privilégier les calculs et applications. Démonstrations attendues sur les théorèmes principaux (TVI, dérivabilité) mais sans la rigueur structurelle de SM.",
    examFormat:
      "Examen national : 3 heures, coefficient 7. 3 à 4 exercices couvrant analyse, complexes, arithmétique et probabilités.",
    specialRules: [
      "PAS de structures algébriques (groupes/anneaux/corps) — réservé à SM",
      "PAS d'espaces vectoriels formels — réservé à SM",
      "Équations différentielles limitées au 1er ordre — pas d'ordre 2",
      "Arithmétique limitée à divisibilité, congruences, PGCD — sans Bézout/Gauss/Fermat formels",
    ],
  },

  // ── Maroc · 2ème Bac · Sciences Physiques (PC) — physics view ────────────
  "MA_2ème Bac_Sciences Physiques (PC)_physics": {
    notation:
      "Filière Sciences Physiques (PC, BIOF). g = 10 m·s⁻² (sauf indication contraire). Concentrations en mol·L⁻¹. Vecteurs avec flèche →.",
    conventions:
      "Programme officiel : (1) Ondes — propagation, ondes mécaniques périodiques, ondes lumineuses, diffraction ; (2) Transformations nucléaires — décroissance radioactive, masse et énergie des noyaux, réactions nucléaires ; (3) Électricité — dipôle RC (charge/décharge), dipôle RL (établissement du courant), oscillations libres et forcées dans RLC, modulation/démodulation d'amplitude ; (4) Mécanique — lois de Newton (deux/trois lois selon contexte), chute libre, mouvement de projectiles, mouvement de satellites/planètes (gravitation, lois de Kepler), pendule pesant/élastique, mouvement de rotation ; (5) Chimie — transformations rapides/lentes, vitesse de réaction, équilibres chimiques (Q_r, K), acide-base (pH, dosage), pile et électrolyse, polymères, contrôle de qualité.",
    stepStyle:
      "Toujours commencer par : système, référentiel, bilan des forces, schéma. Pour la cinétique : équation différentielle de la vitesse. Mécanismes en chimie organique abordés de manière simplifiée (sans flèches courbes formelles comme en France).",
    examFormat:
      "Examen national : 3h30, coefficient 7. 4 à 5 exercices couvrant les 5 thèmes obligatoires (ondes, nucléaire, électricité RC/RL/RLC, mécanique, chimie). Calculatrice non programmable autorisée. Formulaire NON fourni — formules à connaître.",
    specialRules: [
      "g = 10 m·s⁻² par défaut (sauf indication contraire)",
      "Formules à apprendre par cœur — pas de formulaire en examen",
      "Pour les ondes : distinguer ondes mécaniques (transversales/longitudinales) et lumineuses",
      "Mécanismes organiques : approche descriptive (substitution, addition, élimination) sans flèches courbes formelles",
      "Vérifier l'homogénéité dimensionnelle de chaque résultat",
    ],
  },

  // ── Maroc · 2ème Bac · SVT — chemistry/biology view ──────────────────────
  "MA_2ème Bac_Sciences de la Vie et de la Terre (SVT)_chemistry": {
    notation:
      "Filière SVT (BIOF) — sciences naturelles dominantes : biologie, géologie, physiologie. Vocabulaire scientifique français standard.",
    conventions:
      "Programme officiel : (1) Génétique et information héréditaire — nature de l'information génétique (ADN, gène, chromosome), expression de l'information génétique (transcription, traduction), génie génétique (techniques, OGM) ; (2) Transmission de l'information génétique — reproduction sexuée, méiose, fécondation, lois statistiques chez les diploïdes (Mendel), hérédité humaine (arbres généalogiques, maladies génétiques) ; (3) Immunologie — soi/non-soi, moyens de défense (immunité innée + adaptative humorale et cellulaire), dysfonctionnements (allergie, auto-immunité, SIDA), aides au système immunitaire (vaccination, sérothérapie) ; (4) Géologie — chaînes de montagnes récentes et tectonique des plaques, métamorphisme et tectonique, granitisation et métamorphisme, déformations tectoniques.",
    stepStyle:
      "Démarche scientifique : observation/document → hypothèse → expérience → résultat → interprétation → conclusion. Toujours s'appuyer sur les documents fournis dans l'exercice (graphiques, photos, schémas). Vocabulaire technique précis exigé.",
    examFormat:
      "Examen national : 3 heures, coefficient 7. 2 ou 3 exercices avec documents : restitution organisée des connaissances + raisonnement scientifique + lecture de documents (caryotype, électrophorèse, courbes immunologiques, coupes géologiques).",
    referenceBooks: [
      "Khaymasvt 2 Bac SVT",
      "NéoSvt manuel 2 Bac SVT BIOF",
    ],
    specialRules: [
      "Vocabulaire technique strict : gène/allèle/locus, phénotype/génotype, méiose I/méiose II, immunité innée/adaptative",
      "Pour la génétique : toujours commencer par établir le génotype des parents, puis appliquer Mendel",
      "Pour l'immunologie : distinguer les phases (reconnaissance, amplification, effectrice)",
      "Pour la géologie : citer les preuves (fossiles, isotopes, structures tectoniques) qui supportent chaque hypothèse",
      "Schémas annotés exigés (cellule en méiose, structure d'une chaîne de montagnes, etc.)",
    ],
  },

  // ── Tunisie · 4ème (Bac) · Section Mathématiques ─────────────────────────
  "TN_4ème (Bac)_Mathématiques_math": {
    notation:
      "Section Mathématiques (la plus exigeante en math au Bac tunisien). Notation FR (virgule décimale, ]a,b[, ln, →u). Coefficient maths : 4.",
    conventions:
      "Programme officiel Ministère de l'Éducation — réforme 2008 et mises à jour. Couvre : (1) Continuité et limites (théorème des valeurs intermédiaires, prolongement par continuité) ; (2) Suites réelles (récurrentes, monotones, adjacentes, théorème de la convergence monotone, suites particulières — arithmétiques, géométriques) ; (3) Dérivabilité (théorème de Rolle, théorème des accroissements finis, sens de variation, optimisation) ; (4) Fonctions réciproques (continuité, dérivabilité, dérivée de la fonction réciproque) ; (5) Primitives et calcul intégral (intégration par parties, changement de variable) ; (6) Fonctions logarithme népérien et exponentielle, fonctions puissances ; (7) Équations différentielles y'+ay=b, y'+ay=f(x), y''+ay'+by=0 ; (8) Nombres complexes (forme algébrique, trigonométrique, exponentielle, équations dans ℂ, applications géométriques) ; (9) Géométrie : isométries du plan (translations, rotations, symétries, déplacements, antidéplacements) ET similitudes ; (10) Arithmétique (divisibilité, congruences, PGCD, théorème de Bézout, théorème de Gauss) ; (11) Probabilités (variables aléatoires, lois discrètes, espérance, variance).",
    stepStyle:
      "Style FR formel hérité du système français. Démonstrations rigoureuses attendues, en particulier pour Rolle, TAF, TVI. Pour les isométries : préciser éléments caractéristiques (axe, centre, angle). Pour les similitudes : donner forme z' = az + b avec |a| = rapport, arg(a) = angle.",
    examFormat:
      "Bac : 4 heures, 20 points, coefficient 4. 4 exercices : analyse (avec étude de fonction complète), complexes/géométrie, arithmétique, probabilités. Calculatrice non programmable autorisée.",
    referenceBooks: [
      "Manuels Ministère Education TN 4ème Math",
      "Sigmaths exercices et corrigés",
    ],
    specialRules: [
      "Géométrie plane : isométries (déplacements/antidéplacements) ET similitudes au programme — particulier à la TN",
      "Arithmétique : Bézout et Gauss attendus avec leurs noms",
      "Équations différentielles d'ordre 2 à coefficients constants au programme",
      "Pour les fonctions réciproques : justifier l'existence par continuité + stricte monotonie",
      "Pas de structures algébriques abstraites (groupes/anneaux) — moins formel que le SM marocain",
    ],
  },

  // ── Tunisie · 4ème (Bac) · Sciences expérimentales — math view ───────────
  "TN_4ème (Bac)_Sciences expérimentales_math": {
    notation:
      "Section Sciences expérimentales — niveau math intermédiaire (entre Mathématiques et Eco-Gestion). Coefficient maths : 3.",
    conventions:
      "Programme math allégé par rapport à la section Mathématiques : limites/continuité, suites, dérivabilité (sans Rolle/TAF formel), fonctions ln/exp, primitives et calcul intégral, équations différentielles simples (1er ordre uniquement), nombres complexes (forme algébrique + module/argument, applications géométriques limitées), probabilités. PAS d'arithmétique avec Bézout/Gauss formels, PAS d'isométries/similitudes, PAS d'équations différentielles d'ordre 2.",
    stepStyle:
      "Style FR mais moins formel que la section Math. Privilégier les calculs et applications. Démonstrations concises.",
    examFormat:
      "Bac : 3 heures, coefficient 3. 3 exercices : analyse (étude de fonction), complexes, probabilités.",
    specialRules: [
      "Programme math allégé — pas d'arithmétique avec Bézout/Gauss",
      "Pas d'isométries/similitudes",
      "Équations différentielles limitées au 1er ordre",
      "Étudier la matière principale (SVT/PC) en parallèle — exercices souvent contextualisés sciences naturelles",
    ],
  },

  // ── Tunisie · 4ème (Bac) · Sciences expérimentales — physics view ────────
  "TN_4ème (Bac)_Sciences expérimentales_physics": {
    notation:
      "Section Sciences expérimentales en physique-chimie. g = 10 m·s⁻². Concentrations en mol·L⁻¹. Vecteurs avec flèche →.",
    conventions:
      "Programme physique-chimie : (1) Mécanique — lois de Newton, mouvement de translation, mouvement de rotation autour d'un axe fixe, oscillations mécaniques libres et forcées (pendule), gravitation universelle ; (2) Électricité — dipôle RC, dipôle RL, dipôle RLC (oscillations libres et forcées, résonance), modulation/démodulation ; (3) Optique et ondes — propagation des ondes mécaniques, ondes lumineuses ; (4) Atomistique et nucléaire — décroissance radioactive, masse-énergie ; (5) Chimie — cinétique chimique, équilibres chimiques, acide-base (pH, dosages), pile et électrolyse, chimie organique simplifiée (alcools, acides carboxyliques, esters, savons).",
    stepStyle:
      "Démarche standard : système, référentiel, bilan des forces, schéma. Pour les équations différentielles d'oscillateur : poser la solution, identifier pulsation/période, conditions initiales.",
    examFormat:
      "Bac : 3h30, coefficient 4. 3 exercices : un mécanique, un électricité, un chimie. Formulaire NON fourni — formules à connaître.",
    specialRules: [
      "g = 10 m·s⁻² par défaut",
      "Pas de formulaire en examen — formules apprises par cœur",
      "Mécanismes en chimie organique abordés de manière descriptive (sans flèches courbes formelles)",
      "Travail pratique évalué : protocoles, courbes, exploitation",
    ],
  },

  // ── Tunisie · 4ème (Bac) · Informatique (Sciences de l'informatique) ─────
  "TN_4ème (Bac)_Informatique_informatics": {
    notation:
      "Section Sciences de l'Informatique (SI). Pseudocode formel TN (DEBUT/FIN/TANTQUE/SI/FINSI/POUR) ET langage Python (depuis 2022). Coefficient informatique : 4.",
    conventions:
      "Programme officiel 2022/2023 (réforme — Pascal remplacé par Python comme langage cible). Six axes : (1) Algorithmique — analyse d'un problème, structures de contrôle, structures de données (tableaux, enregistrements, fichiers), procédures et fonctions, récursivité ; (2) Programmation — implémentation Python des algorithmes (anciennement Pascal) ; (3) Bases de données — modèle relationnel, SQL (CREATE TABLE, SELECT, INSERT, UPDATE, DELETE, JOIN), normalisation, MERISE (modèle conceptuel/logique/physique de données) ; (4) Systèmes, technologies et Internet — réseaux locaux, Internet, services web ; (5) Pensée computationnelle — décomposition, abstraction, généralisation ; (6) Robotique et IoT (introduction).",
    stepStyle:
      "TOUJOURS commencer par : (a) analyse du problème (entrées/sorties/traitement), (b) algorithme en pseudocode TN (DEBUT/FIN), (c) tableau de déclaration des objets (TDO), (d) traduction en Python (ou Pascal pour anciens cursus). Les types doivent être déclarés explicitement : ENTIER, REEL, CHAINE DE CARACTERES, BOOLEEN, TABLEAU, ENREGISTREMENT.",
    examFormat:
      "Bac : épreuve théorique 3 heures (algorithmique, programmation, BDD, MCD/MLD) coefficient 1.5 + épreuve pratique sur ordinateur 2 heures (programmation Python + SQL) coefficient 1.5. Bac pratique tunisien célèbre — on construit une appli complète à partir d'un cahier des charges.",
    referenceBooks: [
      "Manuels MEN TN 4ème SI (Algorithmique et programmation)",
      "Manuels MEN TN 4ème SI (Bases de données)",
    ],
    specialRules: [
      "CRITIQUE : pseudocode TN avec DEBUT/FIN — NE PAS utiliser le style Python pseudocode FR",
      "Tableau de déclaration des objets (TDO) OBLIGATOIRE avant tout algorithme",
      "Bac pratique sur ordinateur — Python + SQLite/MySQL",
      "Pour la BDD : MCD (Merise) avec entités/associations/cardinalités, puis MLD relationnel, puis SQL",
      "Récursivité au programme — toujours identifier cas de base + cas récursif",
      "Anciennement Pascal — depuis 2022 c'est Python 3 ; certaines questions peuvent rester en Pascal",
      "Pas de notation Big-O formelle — analyse de complexité descriptive",
    ],
  },

  // ── Tunisie · 4ème (Bac) · Section Technique — math view ─────────────────
  "TN_4ème (Bac)_Technique_math": {
    notation:
      "Section Technique — programme math proche des Sciences expérimentales mais avec applications ingénierie. Coefficient maths : 3.",
    conventions:
      "Programme math identique à Sciences expérimentales pour l'essentiel : analyse (limites, dérivabilité, primitives, intégrales), suites, ln/exp, équations différentielles simples, nombres complexes, probabilités. Applications fréquentes en mécanique/électricité.",
    stepStyle:
      "Calculs et applications privilégiés. Exercices souvent contextualisés (transmission de mouvement, circuits RC/RL, signaux).",
    examFormat:
      "Bac : 3 heures, coefficient 3. 3 exercices.",
    specialRules: [
      "Programme math identique à Sciences expérimentales",
      "Élève suit Génie Mécanique + Génie Électrique en parallèle",
    ],
  },

  // ── Tunisie · 4ème (Bac) · Section Technique — physics view ──────────────
  "TN_4ème (Bac)_Technique_physics": {
    notation:
      "Section Technique en physique : focus sur les applications en génie mécanique et génie électrique. g = 10 m·s⁻².",
    conventions:
      "Programme physique-chimie identique à Sciences expérimentales (mécanique, électricité, ondes, nucléaire, chimie). MAIS l'élève suit aussi : (a) Génie Mécanique — analyse fonctionnelle (FAST), transmission de mouvement (poulies, chaînes, engrenages, came, excentrique, pignon-crémaillère, bielle-manivelle), guidage en translation, liaisons mécaniques ; (b) Génie Électrique — logique combinatoire et séquentielle, compteurs, unité arithmétique et logique (UAL), automates programmables (API), microcontrôleurs.",
    stepStyle:
      "Pour génie mécanique : schéma cinématique ou diagramme FAST. Pour génie électrique : table de vérité, équation logique simplifiée (Karnaugh), schéma logique.",
    examFormat:
      "Bac : 3h30 physique-chimie + épreuves spécifiques génie mécanique et génie électrique.",
    specialRules: [
      "Génie mécanique au programme — pas en Sciences expérimentales",
      "Génie électrique au programme — logique numérique, API, microcontrôleurs",
      "Pour les transmissions : calculer rapport de transmission, vitesse de sortie",
    ],
  },

  // ── Tunisie · 4ème (Bac) · Économie & Gestion — math view ────────────────
  "TN_4ème (Bac)_Économie & Gestion_math": {
    notation:
      "Section Économie & Gestion — programme math le plus allégé du Bac scientifique tunisien. Coefficient maths : 2.",
    conventions:
      "Programme math allégé : (1) Analyse — limites, dérivabilité, primitives, intégrales (sans intégration par parties complexe) ; (2) Fonctions ln/exp (focus applications économiques : intérêt composé, croissance exponentielle, fonctions de coût/recette/profit) ; (3) Suites arithmétiques et géométriques (applications financières) ; (4) Statistiques à deux variables (régression linéaire, ajustement affine, méthode des moindres carrés, coefficient de corrélation) ; (5) Probabilités (variables aléatoires, espérance, variance) ; (6) Théorie des graphes (graphes orientés, matrice d'adjacence, plus court chemin).",
    stepStyle:
      "Approche orientée applications économiques et gestion. Calculs financiers, optimisation économique. Démonstrations limitées.",
    examFormat:
      "Bac : 2 heures, coefficient 2. 2 ou 3 exercices : analyse appliquée, statistiques, probabilités/graphes.",
    specialRules: [
      "PAS de nombres complexes au programme — particulier à cette section",
      "PAS d'arithmétique abstraite",
      "PAS d'équations différentielles",
      "Statistiques à 2 variables et régression linéaire au programme — central",
      "Théorie des graphes au programme (orientés, plus court chemin)",
      "Exercices contextualisés économie/gestion : coûts, recettes, profits, intérêts composés, démographie",
    ],
  },

  // ── Deutschland · Abitur · Leistungskurs (LK) — math view ────────────────
  "DE_Abitur_Leistungskurs (LK)_math": {
    notation:
      "Leistungskurs Mathematik (5 Wochenstunden, erhöhtes Anforderungsniveau). Komma als Dezimaltrennzeichen (3,14 nicht 3.14). Standardnotation für Intervalle: [a;b] geschlossen, ]a;b[ offen (deutsche Variante mit Semikolon). Vektoren mit Pfeil oder fettgedruckt: →v oder v.",
    conventions:
      "KMK-Bildungsstandards 2012 für die Allgemeine Hochschulreife. Drei Leitideen: (1) Analysis — Folgen und Grenzwerte, Differentialrechnung (e-Funktion, Logarithmus, trigonometrische Funktionen, ihre Verkettungen), Kurvendiskussion (Extrema, Wendepunkte, Asymptoten), Integralrechnung (bestimmtes/unbestimmtes Integral, Hauptsatz der Differential- und Integralrechnung, Substitutionsregel, partielle Integration im LK), Anwendungen (Volumen, Mittelwert) ; (2) Lineare Algebra / Analytische Geometrie — Vektoren im ℝ³, Skalarprodukt, Vektorprodukt (Kreuzprodukt) im LK, Geraden und Ebenen (Parameter-, Normalen- und Koordinatenform), Lagebeziehungen, Abstände, Winkel, lineare Gleichungssysteme (Gauß-Verfahren), Matrizen und Übergangsmatrizen (Markow-Ketten) im LK ; (3) Stochastik — Zufallsgrößen, Wahrscheinlichkeitsverteilungen, Bernoulli-Ketten und Binomialverteilung, Erwartungswert, Varianz, Standardabweichung, Hypothesentests (einseitig + zweiseitig im LK), Normalverteilung als stetige Verteilung im LK.",
    stepStyle:
      "Sehr formaler Stil, präzise Begründungen erforderlich. Sätze beim Namen nennen (Mittelwertsatz, Fundamentalsatz der Analysis, Hauptsatz). Bei Funktionsuntersuchungen vollständige Kurvendiskussion: Definitionsbereich, Symmetrie, Nullstellen, Achsenschnitte, Extrempunkte, Wendepunkte, Verhalten im Unendlichen, Skizze.",
    examFormat:
      "Schriftliche Abiturprüfung LK: 240–300 Minuten (je nach Bundesland), erhöhtes Anforderungsniveau, max. 120 Punkte. Zwei Teile: (A) hilfsmittelfreier Teil — kurze Aufgaben ohne Taschenrechner, (B) Hauptteil mit GTR/CAS oder Tabellenkalkulation, mehrere komplexe Aufgaben mit Teilaufgaben. Je mindestens ein Drittel Analysis. Stochastik und Geometrie ergänzen.",
    referenceBooks: [
      "Lambacher Schweizer Mathematik Qualifikationsphase LK (Klett)",
      "Bigalke/Köhler Mathematik Sekundarstufe II (Cornelsen)",
      "Elemente der Mathematik LK (Schroedel/Westermann)",
    ],
    specialRules: [
      "Erhöhtes Anforderungsniveau — Komplexität, Tiefe, Eigenständigkeit höher als im GK",
      "Vektorprodukt (Kreuzprodukt) NUR im LK — im GK nicht enthalten",
      "Übergangsmatrizen / Markow-Ketten NUR im LK",
      "Normalverteilung als stetige Verteilung NUR im LK (im GK nur diskret)",
      "Partielle Integration NUR im LK",
      "Beim Hypothesentest: zweiseitige Tests im LK, einseitige im GK",
      "Hilfsmittelfreier Teil A obligatorisch — keine Rechner, kein Tafelwerk",
    ],
  },

  // ── Deutschland · Abitur · Grundkurs (GK) — math view ────────────────────
  "DE_Abitur_Grundkurs (GK)_math": {
    notation:
      "Grundkurs Mathematik (3 Wochenstunden, grundlegendes Anforderungsniveau). Komma als Dezimaltrennzeichen, [a;b] / ]a;b[, →v.",
    conventions:
      "KMK-Bildungsstandards 2012, grundlegendes Anforderungsniveau. Selbe drei Leitideen wie LK aber reduzierte Tiefe: (1) Analysis — Differentialrechnung (e-Funktion, Logarithmus, trigonometrische Funktionen), Kurvendiskussion, Integralrechnung (Hauptsatz, einfache Substitution — KEINE partielle Integration), Anwendungen ; (2) Analytische Geometrie — Vektoren im ℝ³, Skalarprodukt (KEIN Kreuzprodukt), Geraden und Ebenen, Lagebeziehungen, Abstände, lineare Gleichungssysteme ; (3) Stochastik — Zufallsgrößen, Bernoulli-Ketten, Binomialverteilung, Erwartungswert, einseitiger Hypothesentest, Normalverteilung NUR als Näherung der Binomialverteilung (nicht als eigenständige stetige Verteilung).",
    stepStyle:
      "Formaler Stil aber mit weniger Tiefe als im LK. Begründungen erforderlich, aber knapper. Vollständige Kurvendiskussion erwartet, jedoch ohne den abstraktesten Anteil.",
    examFormat:
      "Schriftliche Abiturprüfung GK: 180–240 Minuten, grundlegendes Anforderungsniveau, max. 90 Punkte. Auch hier Teil A (hilfsmittelfrei) + Teil B (mit GTR). Aufgaben weniger komplex als im LK, Vorstrukturierung höher.",
    referenceBooks: [
      "Lambacher Schweizer Mathematik Qualifikationsphase GK (Klett)",
      "Bigalke/Köhler GK (Cornelsen)",
    ],
    specialRules: [
      "Grundlegendes Anforderungsniveau — Komplexität reduziert",
      "KEIN Vektorprodukt / Kreuzprodukt",
      "KEINE Übergangsmatrizen / Markow-Ketten",
      "KEINE partielle Integration — nur einfache Substitution",
      "Hypothesentest: nur einseitig",
      "Normalverteilung: nur als Näherung der Binomialverteilung (Stichwort Sigma-Regeln)",
      "Hilfsmittelfreier Teil A obligatorisch wie im LK",
    ],
  },

  // ── Deutschland · Abitur · Leistungskurs (LK) — physics view ─────────────
  "DE_Abitur_Leistungskurs (LK)_physics": {
    notation:
      "Leistungskurs Physik (5 Wochenstunden, erhöhtes Anforderungsniveau). g ≈ 9,81 m·s⁻². SI-Einheiten strikt. Vektoren mit Pfeil →F oder fettgedruckt F.",
    conventions:
      "KMK-Bildungsstandards. Themengebiete (LK-Tiefe): (1) Mechanik — Kinematik (gleichförmige + gleichmäßig beschleunigte Bewegung), Dynamik (Newtonsche Gesetze, Impuls und Impulserhaltung, Arbeit/Energie/Leistung, Energieerhaltung), Schwingungen (harmonische Schwingung, Pendel, gedämpfte/erzwungene Schwingung), Wellen (longitudinal/transversal, Interferenz, stehende Wellen) ; (2) Elektrodynamik — elektrische und magnetische Felder, Coulomb-Gesetz, elektrisches Feld im Plattenkondensator, Bewegung geladener Teilchen in Feldern, Lorentzkraft, Induktion (Faradaysches Gesetz, Selbstinduktion), Wechselstromkreise, elektromagnetische Schwingungen und Wellen ; (3) Quantenphysik — Photoeffekt (Einstein), de-Broglie-Materiewellen, Welle-Teilchen-Dualismus, Heisenbergsche Unschärferelation, Atommodelle, Energiequantelung ; (4) Atom- und Kernphysik — Atomspektren, Kernumwandlungen, Radioaktivität, Bindungsenergie, Massendefekt.",
    stepStyle:
      "Sätze und Gesetze beim Namen nennen. Schritte: Skizze, gegebene Größen, gesuchte Größe, physikalisches Gesetz, Formel, Einheitenkontrolle, Ergebnis mit Einheit. Diagramme (s-t-, v-t-, F-s-, U-I-, U-t-Diagramme) korrekt beschriften und auswerten.",
    examFormat:
      "Schriftliche Abiturprüfung Physik LK: 240–300 Minuten. Aufgaben kombinieren Mechanik, Elektrodynamik, Quantenphysik. Auswertung von Experimenten häufig zentral.",
    referenceBooks: [
      "Metzler Physik Sekundarstufe II (Schroedel)",
      "Dorn-Bader Physik Sek II (Schroedel/Westermann)",
      "Cornelsen Physik LK Oberstufe",
    ],
    specialRules: [
      "Relativitätstheorie ist seit 2025 NICHT mehr Pflichtinhalt im Zentralabitur",
      "Quantenphysik im LK quantitativ — Photoeffekt mit hf = W_A + E_kin",
      "Im LK formal: Schwingungsdifferentialgleichung lösen",
      "Lorentzkraft mit Vektorprodukt im LK (im GK qualitativ)",
      "Induktion quantitativ mit Faradayschem Gesetz",
      "SI-Einheiten konsequent — Einheitenkontrolle bei jedem Endergebnis",
    ],
  },

  // ── Deutschland · Abitur · Grundkurs (GK) — physics view ─────────────────
  "DE_Abitur_Grundkurs (GK)_physics": {
    notation:
      "Grundkurs Physik (3 Wochenstunden, grundlegendes Anforderungsniveau). g ≈ 9,81 m·s⁻². SI-Einheiten.",
    conventions:
      "KMK-Bildungsstandards, GK-Tiefe: Themen (1) Wellen und Teilchen in Feldern — Bewegung in elektrischen und magnetischen Feldern, Lorentzkraft (qualitativ), Wellenphänomene ; (2) Quantenobjekte — Photoeffekt qualitativ, Doppelspaltexperiment, Welle-Teilchen-Dualismus, einfache Atommodelle ; (3) Elektrodynamik und Energieübertragung — elektrische und magnetische Felder, Induktion (qualitativ und einfache quantitative Anwendungen), Wechselstrom, Transformator ; (4) Strahlung und Materie — Atomspektren, Radioaktivität, Kernumwandlungen, Halbwertszeit.",
    stepStyle:
      "Weniger formal als LK. Begründungen mit physikalischen Gesetzen, aber komplexe Differentialgleichungen werden nicht vollständig hergeleitet. Auswertung von Experimenten und Diagrammen weiterhin wichtig.",
    examFormat:
      "Schriftliche Abiturprüfung Physik GK: 180–240 Minuten. Drei Aufgabenfelder kombinierend.",
    specialRules: [
      "Quantenphysik im GK qualitativ — Formel hf = W_A + E_kin als gegebene Beziehung",
      "Lorentzkraft im GK qualitativ — Skalarbetrag F = qvB ohne Vektorprodukt",
      "Schwingungs-DGL nicht gelöst — nur Ergebnisse genutzt (sin/cos-Form)",
      "Induktion qualitativ + einfache U_ind-Berechnungen",
      "Relativitätstheorie nicht mehr Pflicht (wie LK)",
    ],
  },

  // ── India · Class 12 (CBSE/NCERT) · PCM — math view ──────────────────────
  "IN_Class 12 (CBSE/NCERT)_Science (PCM — Physics, Chemistry, Math)_math": {
    notation:
      "CBSE Class 12 Mathematics (Subject Code 041). Decimal point (3.14, NOT comma). Standard interval notation (a, b) for open and [a, b] for closed. Use ln for natural log; log without base means log₁₀ in many older NCERT contexts but for calculus log = ln. Vectors written in bold or with arrow.",
    conventions:
      "CBSE/NCERT 2025-26 syllabus: 80 marks theory + 20 marks internal assessment. Six units : (1) Relations and Functions — types of relations (reflexive, symmetric, transitive, equivalence), one-one and onto functions, inverse trigonometric functions (definition, domain, range, principal value branch, graphs, properties) ; (2) Algebra — matrices (types, transpose, symmetric/skew-symmetric, operations, invertible matrices), determinants (minors, cofactors, adjoint, inverse via adjoint, system of linear equations using matrix method) ; (3) Calculus (35 marks — highest weightage) — continuity and differentiability (chain rule, derivatives of inverse trig and logarithmic functions, logarithmic differentiation, derivatives of functions in parametric forms, second order derivatives), applications of derivatives (rate of change, increasing/decreasing functions, maxima and minima — both first and second derivative tests), integrals (integration by substitution, partial fractions, by parts, definite integrals as a limit of sum, fundamental theorem of calculus, properties of definite integrals), applications of integrals (area under curves, between two curves), differential equations (formation, order, degree, solving by separation of variables, homogeneous DEs, linear DEs of first order with integrating factor) ; (4) Vectors and 3D Geometry — vectors (position, dot product, cross product, scalar/vector triple product NOT in CBSE since 2024), 3D geometry (direction cosines/ratios, equation of line in space, equation of plane, angle between lines/planes, distance from point to plane) ; (5) Linear Programming — LP problems with two variables, graphical method, feasible region ; (6) Probability — conditional probability, multiplication theorem, independent events, Bayes' theorem, random variables and probability distributions, mean of random variables.",
    stepStyle:
      "Show every step explicitly. State theorems by name (Mean Value Theorem, Rolle's Theorem, Bayes' Theorem). For matrix problems: write out matrices in full at each step. For integration: show substitution explicitly (let u = …). For probability: write event definitions and Bayes' formula before substituting.",
    examFormat:
      "Board exam: 3 hours, 80 marks theory. Section A: 18 MCQs (1 mark) + 2 Assertion-Reason (1 mark). Section B: 5 short answers (2 marks). Section C: 6 short answers (3 marks). Section D: 4 long answers (5 marks). Section E: 3 case-study questions (4 marks each, with sub-parts). Internal choices in some questions. Calculator NOT allowed.",
    referenceBooks: [
      "NCERT Mathematics Textbook for Class 12 (Part I & II)",
      "R.D. Sharma Mathematics Class 12",
      "R.S. Aggarwal Senior Secondary Mathematics",
      "Cengage Mathematics for JEE (advanced reference)",
      "Arihant All-in-One Mathematics Class 12",
    ],
    specialRules: [
      "NO calculator allowed in the board exam — all computations by hand",
      "Vector triple product / scalar triple product REMOVED from CBSE syllabus since 2024",
      "Statistics chapter (PMF, mean of random variable) is part of probability — variance and standard deviation REMOVED for board exam",
      "Linear programming kept but limited to 2-variable problems with graphical solution",
      "Determinant of 3×3 matrix expected — by cofactor expansion or properties of determinants",
      "Integration by partial fractions: cover all cases — distinct linear, repeated linear, irreducible quadratic",
      "Bayes' theorem ALWAYS in the exam — write it before applying",
      "First derivative test AND second derivative test both expected for maxima/minima",
    ],
  },

  // ── India · Class 12 (CBSE/NCERT) · PCM — physics view ───────────────────
  "IN_Class 12 (CBSE/NCERT)_Science (PCM — Physics, Chemistry, Math)_physics": {
    notation:
      "CBSE Class 12 Physics (Subject Code 042). SI units strictly. g = 9.8 m/s² unless specified. Use ε₀ = 8.85×10⁻¹² C²/N·m² (or 1/4πε₀ = 9×10⁹). Decimal point. Vectors with arrow or bold.",
    conventions:
      "CBSE/NCERT 2025-26 syllabus: 70 marks theory + 30 marks practical. NCERT covers 14 chapters in two parts. Units: (1) Electrostatics (16 marks) — Coulomb's law, electric field, dipole, Gauss's law and applications, electric potential, capacitors, energy stored ; (2) Current Electricity (10 marks) — Ohm's law, drift velocity, resistivity, Kirchhoff's laws, Wheatstone bridge, internal resistance, EMF, cells in series/parallel, potentiometer ; (3) Magnetic Effects of Current and Magnetism (8 marks) — Biot-Savart law, Ampere's circuital law, force on current-carrying conductor, torque on current loop, moving coil galvanometer, Lorentz force, magnetic dipole moment, Earth's magnetism (basic) ; (4) Electromagnetic Induction and Alternating Current (8 marks) — Faraday's laws, Lenz's law, self/mutual inductance, AC circuits (RC, RL, RLC), resonance, transformer, generator ; (5) Electromagnetic Waves (3 marks) — Maxwell's displacement current concept, EM spectrum ; (6) Optics (10 marks) — ray optics (reflection, refraction, lenses, lens-maker's formula, prism, optical instruments — microscope, telescope), wave optics (Huygens' principle, Young's double slit, single slit diffraction, polarisation by reflection — Brewster's angle) ; (7) Dual Nature of Matter (4 marks) — photoelectric effect, Einstein's equation, de Broglie wavelength, Davisson-Germer experiment ; (8) Atoms and Nuclei (6 marks) — Bohr's atomic model, hydrogen spectrum (Lyman, Balmer, Paschen series), nuclear binding energy, mass-energy relation, radioactivity, half-life, nuclear fission and fusion ; (9) Electronic Devices (7 marks) — semiconductors (intrinsic + extrinsic), p-n junction diode, rectifiers (half/full-wave), Zener diode, photodiode, LED, solar cell, transistor (basic concept).",
    stepStyle:
      "Always: given data, formula/principle, substitution, answer with units, significant figures. State laws by name (Faraday's law, Lenz's law, Ampere's law, Gauss's law, Bohr's postulates). Diagrams expected for ray optics, circuits, and Wheatstone bridge.",
    examFormat:
      "Board exam: 3 hours, 70 marks. Section A: 16 MCQs (1 mark each). Section B: 5 very short (2 marks). Section C: 7 short (3 marks). Section D: 2 case-study (4 marks). Section E: 3 long-answer with internal choice (5 marks). Practical exam: 30 marks (experiments + activities + project).",
    referenceBooks: [
      "NCERT Physics Class 12 (Part I & II)",
      "H.C. Verma Concepts of Physics",
      "DC Pandey Understanding Physics (for JEE/NEET)",
      "S.L. Arora Physics Class 12",
    ],
    specialRules: [
      "NO calculator — all arithmetic by hand; common values (e=1.6×10⁻¹⁹, h=6.63×10⁻³⁴, c=3×10⁸) memorised",
      "Communication Systems chapter REMOVED from CBSE syllabus since 2023",
      "All numerical answers MUST include units and use significant figures appropriately",
      "Practical-related questions appear in Section A — graph interpretation, experimental setup",
      "Derivations are tested: e.g., expression for capacitance of parallel plate, lens-maker's formula, expression for fringe width in YDSE, Bohr radius",
      "Diagrams must be neatly drawn with labels — circuit symbols standardised",
      "Magnetism (chapter 5) was REDUCED in 2023 — Earth's magnetism now only conceptual",
    ],
  },

  // ── India · Class 12 (CBSE/NCERT) · PCM — chemistry view ─────────────────
  "IN_Class 12 (CBSE/NCERT)_Science (PCM — Physics, Chemistry, Math)_chemistry": {
    notation:
      "CBSE Class 12 Chemistry (Subject Code 043). SI units; concentration usually mol/L (M). Use Kelvin for temperature in thermodynamics/kinetics. Standard NCERT IUPAC nomenclature.",
    conventions:
      "CBSE/NCERT 2025-26 syllabus: 70 marks theory + 30 marks practical. NCERT divided into 10 chapters (post-2023 reduction). Units: (1) Solutions — types, concentration units (mole fraction, molality, molarity, ppm), Raoult's law, ideal/non-ideal solutions, colligative properties (relative lowering of vapour pressure, elevation of BP, depression of FP, osmotic pressure, van't Hoff factor) ; (2) Electrochemistry — redox, galvanic cells, electrode potential, Nernst equation, conductivity, Kohlrausch's law, electrolysis, Faraday's laws, batteries (primary/secondary), fuel cells, corrosion ; (3) Chemical Kinetics — rate, order, molecularity, integrated rate equations (zero and first order), half-life, Arrhenius equation, collision theory ; (4) d- and f-Block Elements — properties of transition elements, KMnO₄, K₂Cr₂O₇ preparations and properties, lanthanoids and actinoids ; (5) Coordination Compounds — Werner's theory, IUPAC nomenclature, isomerism (geometrical, optical), bonding (VBT, CFT, splitting of d-orbitals), magnetic moment ; (6) Haloalkanes and Haloarenes — nomenclature, preparation, physical/chemical properties, SN1/SN2 mechanisms, environmental effects ; (7) Alcohols, Phenols and Ethers — preparation, properties, mechanisms ; (8) Aldehydes, Ketones and Carboxylic Acids — preparation, nucleophilic addition, oxidation/reduction, acidity ; (9) Amines — preparation, basicity, diazonium salts, reactions ; (10) Biomolecules — carbohydrates (mono/di/polysaccharides), proteins (α-amino acids, structure), nucleic acids, vitamins (basic).",
    stepStyle:
      "For organic mechanisms: use curved arrows showing electron pair movement, label intermediates (carbocation, carbanion, free radical), show transition states. For numerical problems: identify quantities, apply formula (e.g., Nernst, Arrhenius, ΔTf = Kf·m·i), substitute with units. For inorganic: balance equations, state colour changes.",
    examFormat:
      "Board exam: 3 hours, 70 marks. Sections A-E mirroring physics. Section A 16 MCQs, Section B 5 short (2m), Section C 7 short (3m), Section D 2 case-study (4m), Section E 3 long with internal choice (5m). Practical 30 marks (salt analysis, titrations, viva, project).",
    referenceBooks: [
      "NCERT Chemistry Class 12 (Part I & II)",
      "Pradeep's New Course Chemistry Class 12",
      "Modern's ABC of Chemistry",
      "O.P. Tandon Inorganic / Organic / Physical (JEE prep)",
    ],
    specialRules: [
      "REMOVED from syllabus 2023+: Solid State (Chapter 1), Surface Chemistry (Chapter 5), p-Block Elements (Group 15-18), Polymers, Chemistry in Everyday Life",
      "NO calculator — log tables provided in physical chemistry numerical questions",
      "Organic mechanisms: SN1, SN2, E1, E2, electrophilic addition/substitution, nucleophilic addition expected with curved arrows",
      "Coordination compounds: must give IUPAC name AND draw structure with stereochemistry",
      "For colligative properties: always identify whether van't Hoff factor i is needed (electrolyte vs. non-electrolyte)",
      "Nernst equation: E = E° - (0.0591/n) log Q at 298 K — memorise this form",
      "Practical: salt analysis (cations + anions), volumetric titrations (KMnO₄, K₂Cr₂O₇)",
    ],
  },

  // ── India · Class 12 (CBSE/NCERT) · PCB — physics view (same as PCM) ─────
  "IN_Class 12 (CBSE/NCERT)_Science (PCB — Physics, Chemistry, Biology)_physics": {
    notation:
      "CBSE Class 12 Physics (Subject Code 042) — IDENTICAL syllabus to PCM stream.",
    conventions:
      "Identical to PCM physics: same 9 units, same NCERT chapters, same exam pattern. The only difference between PCM and PCB at school level is that PCB students take Biology instead of Mathematics — physics syllabus is shared.",
    specialRules: [
      "Physics syllabus IDENTICAL to PCM — same chapters, same exam, same marking",
      "PCB students typically aim for NEET (medical entrance) — physics questions in NEET are still based on NCERT",
    ],
  },

  // ── India · Class 12 (CBSE/NCERT) · PCB — chemistry view (same as PCM) ───
  "IN_Class 12 (CBSE/NCERT)_Science (PCB — Physics, Chemistry, Biology)_chemistry": {
    notation:
      "CBSE Class 12 Chemistry (Subject Code 043) — IDENTICAL syllabus to PCM stream.",
    conventions:
      "Identical to PCM chemistry: same 10 chapters, same exam pattern.",
    specialRules: [
      "Chemistry syllabus IDENTICAL to PCM — only the third subject (Biology vs Math) differs",
    ],
  },

  // Note on PCB Biology: the current Subject enum is {math, physics,
  // chemistry, informatics}. Biology has no dedicated profile yet — when
  // subject==chemistry is used for a PCB student, the chemistry overlay
  // above applies (same NCERT chemistry as PCM). A future enum extension
  // can add a Biology overlay covering: Reproduction (sexual reproduction
  // in flowering plants, human reproduction, reproductive health), Genetics
  // & Evolution (Mendelian inheritance, molecular basis — DNA replication/
  // transcription/translation, genetic code, Human Genome Project, evolution
  // theories), Biology in Human Welfare (human health and disease, microbes),
  // Biotechnology (principles, recombinant DNA, applications), Ecology
  // (organisms/populations, ecosystem, biodiversity & conservation).

  // ── France · Terminale · Spécialité NSI (6h/sem) ─────────────────────────
  "FR_Terminale_Spécialité NSI_informatics": {
    notation:
      "Section Spécialité NSI (Numérique et Sciences Informatiques, 6h/sem). Langage : Python 3 exclusivement. Convention de nommage Python (snake_case). Indentation 4 espaces.",
    conventions:
      "Programme BO spécial n°8 du 25 juillet 2019. Six parties : (1) Histoire de l'informatique — repères historiques, machines emblématiques ; (2) Structures de données — listes, piles, files, dictionnaires, arbres binaires (parcours préfixe/infixe/postfixe), arbres binaires de recherche, graphes (matrice d'adjacence, liste d'adjacence) ; (3) Bases de données — modèle relationnel, SQL (SELECT, JOIN, WHERE, GROUP BY), opérations CRUD, contraintes d'intégrité, transactions ACID ; (4) Architectures matérielles, systèmes d'exploitation, réseaux — composants d'un OS, processus, ordonnancement, gestion mémoire, modèle TCP/IP, routage, commandes Unix de base ; (5) Langages et programmation — POO (classes, attributs, méthodes, héritage, encapsulation), récursivité, modularité, mise au point (debug), tests unitaires ; (6) Algorithmique — diviser pour régner (tri fusion, tri rapide), recherche dichotomique, programmation dynamique (sac à dos, sous-suite commune), parcours de graphes (DFS, BFS), algorithme de Dijkstra (plus court chemin), méthode gloutonne, complexité (notation O grand).",
    stepStyle:
      "Pour les algorithmes : énoncer le principe (diviser/régner, glouton, programmation dynamique), tracer la complexité (O), justifier la terminaison et la correction. Code Python complet avec docstrings et types optionnels (typing module).",
    examFormat:
      "BAC : épreuve écrite 3h30 (12 points) + épreuve pratique sur ordinateur 1h (8 points = 2 exercices de programmation). Total 20 points, coefficient 16.",
    referenceBooks: [
      "NSI Terminale (Ellipses)",
      "NSI Terminale (Hachette)",
      "NSI Terminale (Bordas)",
      "Documentation officielle Python 3",
    ],
    specialRules: [
      "Langage : Python 3 strictement — pas de Python 2, pas d'autres langages",
      "Pour les graphes, choisir explicitement entre matrice d'adjacence et liste d'adjacence selon la complexité",
      "Énoncer la complexité (O) de tout algorithme proposé",
      "Récursivité : toujours identifier cas de base + cas récursif + preuve de terminaison",
      "POO : utiliser self comme premier paramètre des méthodes d'instance",
      "SQL : majuscules pour les mots-clés (SELECT, FROM, WHERE)",
    ],
  },
};

/** Apply a section overlay onto a base profile, merging text/array fields. */
function mergeOverlay(
  base: CurriculumProfile,
  overlay: Partial<ProfileData>,
): CurriculumProfile {
  const out: CurriculumProfile = { ...base };
  for (const k of Object.keys(overlay) as Array<keyof ProfileData>) {
    const v = (overlay as Record<string, unknown>)[k];
    if (v === undefined) continue;
    if (k === "specialRules" || k === "referenceBooks" || k === "gradeLevels") {
      const baseArr = (base[k] as string[] | undefined) ?? [];
      (out as Record<string, unknown>)[k] = [...baseArr, ...(v as string[])];
    } else if (
      k === "notation" ||
      k === "conventions" ||
      k === "stepStyle" ||
      k === "examFormat" ||
      k === "exerciseStyle" ||
      k === "notes"
    ) {
      const baseTxt = (base[k] as string | undefined) ?? "";
      (out as Record<string, unknown>)[k] = baseTxt
        ? `${baseTxt}\n— Section : ${v as string}`
        : (v as string);
    } else {
      (out as Record<string, unknown>)[k] = v;
    }
  }
  return out;
}

/**
 * Look up a static curriculum profile, optionally narrowed by grade level
 * and section (filière / Spécialité / Leistungskurs / PCM-PCB / etc.).
 *
 * Resolution order:
 *   1. Base profile = `{COUNTRY}_{subject}` if available, else `{COUNTRY}`.
 *   2. If gradeLevel + section provided, look for a section overlay
 *      `{COUNTRY}_{LEVEL}_{SECTION}_{subject}` then `{COUNTRY}_{LEVEL}_{SECTION}`
 *      and merge it onto the base.
 *   3. Returns null if neither base nor overlay matches (caller falls back to
 *      Firestore, then to Claude's built-in knowledge).
 */
export function lookupStaticProfile(
  countryCode: string,
  subject?: Subject,
  gradeLevel?: string,
  section?: string,
): CurriculumProfile | null {
  const normalized = countryCode.trim().toUpperCase();
  if (!normalized) return null;

  let base: CurriculumProfile | null = null;
  if (subject) {
    const e = STATIC_CURRICULUM_PROFILES[`${normalized}_${subject}`];
    if (e) base = { countryCode: normalized, ...e };
  }
  if (!base) {
    const e = STATIC_CURRICULUM_PROFILES[normalized];
    if (e) base = { countryCode: normalized, ...e };
  }

  if (gradeLevel && section) {
    const lvl = gradeLevel.trim();
    const sec = section.trim();
    const key1 = subject ? `${normalized}_${lvl}_${sec}_${subject}` : null;
    const key2 = `${normalized}_${lvl}_${sec}`;
    const overlay =
      (key1 && STATIC_SECTION_PROFILES[key1]) || STATIC_SECTION_PROFILES[key2];
    if (overlay) {
      const root = base ?? { countryCode: normalized };
      return mergeOverlay(root, overlay);
    }
  }

  return base;
}
