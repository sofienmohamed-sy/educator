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
 * Look up a static curriculum profile.
 * Returns the subject-specific entry if it exists, otherwise the country-level
 * entry, otherwise null (caller falls back to Firestore).
 */
export function lookupStaticProfile(
  countryCode: string,
  subject?: Subject,
): CurriculumProfile | null {
  const normalized = countryCode.trim().toUpperCase();
  if (!normalized) return null;

  if (subject) {
    const subjectEntry = STATIC_CURRICULUM_PROFILES[`${normalized}_${subject}`];
    if (subjectEntry) return { countryCode: normalized, ...subjectEntry };
  }

  const countryEntry = STATIC_CURRICULUM_PROFILES[normalized];
  if (countryEntry) return { countryCode: normalized, ...countryEntry };

  return null;
}
