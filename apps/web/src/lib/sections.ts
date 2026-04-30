/**
 * Sections / tracks / filières per (country, level).
 *
 * Many curricula split a single grade level into distinct tracks that share
 * the room and the certificate but cover different programs. Examples:
 *
 *   FR Terminale     → Spécialité Maths, Maths Expertes, NSI, ...
 *   MA 2ème Bac      → Sciences Maths A/B, PC, SVT, SE, ST
 *   TN 4ème (Bac)    → Math, Sciences expérimentales, Technique, Informatique
 *   DE Abitur        → Leistungskurs (advanced) vs Grundkurs (basic)
 *   IN Class 12      → Science (PCM), Science (PCB), Commerce, Humanities
 *   ES 2º Bach       → Ciencias y Tecnología, Humanidades, Artes
 *
 * Several levels can map to the same section list (e.g., for Morocco the
 * filière is normally chosen at 1ère Bac and stays for 2ème Bac), which is
 * what "some levels are common" means in practice.
 *
 * Lookup keys, in order of preference:
 *   1. `${COUNTRY}_${level}`  — exact level match
 *   2. `${COUNTRY}`           — country-wide fallback (any level)
 *   3. `[]`                   — no sectioning, picker hides itself
 */
const SECTIONS: Record<string, string[]> = {
  // ── FRANCE — Spécialités take in Première & Terminale (post-2019 reform) ──
  "FR_Première": [
    "Spécialité Maths",
    "Spécialité Physique-Chimie",
    "Spécialité SVT",
    "Spécialité NSI",
    "Spécialité SES",
    "Spécialité HGGSP",
    "Spécialité HLP",
    "Spécialité LLCE",
    "Tronc commun",
  ],
  "FR_Terminale": [
    "Spécialité Maths",
    "Maths Expertes (option)",
    "Maths Complémentaires (option)",
    "Spécialité Physique-Chimie",
    "Spécialité SVT",
    "Spécialité NSI",
    "Spécialité SES",
    "Spécialité HGGSP",
    "Spécialité HLP",
    "Spécialité LLCE",
    "Tronc commun",
  ],

  // ── MOROCCO — filière chosen at Tronc commun, kept through 1ère/2ème Bac ──
  "MA_1ère Bac": [
    "Sciences Mathématiques",
    "Sciences Physiques (PC)",
    "Sciences de la Vie et de la Terre (SVT)",
    "Sciences Économiques",
    "Sciences et Technologies Mécaniques (STM)",
    "Sciences et Technologies Électriques (STE)",
    "Lettres et Sciences Humaines",
  ],
  "MA_2ème Bac": [
    "Sciences Mathématiques A",
    "Sciences Mathématiques B",
    "Sciences Physiques (PC)",
    "Sciences de la Vie et de la Terre (SVT)",
    "Sciences Économiques",
    "Sciences et Technologies Mécaniques (STM)",
    "Sciences et Technologies Électriques (STE)",
    "Lettres et Sciences Humaines",
  ],
  "MA_Tronc commun": [
    "Tronc commun scientifique",
    "Tronc commun technologique",
    "Tronc commun lettres",
  ],

  // ── TUNISIA — sections start at 2ème; kept through 3ème and 4ème (Bac) ─────
  "TN_2ème secondaire": [
    "Sciences",
    "Sciences de l'informatique",
    "Sciences techniques",
    "Économie & Services",
    "Lettres",
  ],
  "TN_3ème secondaire": [
    "Mathématiques",
    "Sciences expérimentales",
    "Technique",
    "Économie & Gestion",
    "Informatique",
    "Lettres",
  ],
  "TN_4ème (Bac)": [
    "Mathématiques",
    "Sciences expérimentales",
    "Technique",
    "Économie & Gestion",
    "Informatique",
    "Lettres",
    "Sport",
  ],

  // ── GERMANY — Leistungskurs (advanced) vs Grundkurs (basic) per subject ──
  "DE_Klasse 11": ["Leistungskurs (LK)", "Grundkurs (GK)"],
  "DE_Klasse 12": ["Leistungskurs (LK)", "Grundkurs (GK)"],
  "DE_Abitur": ["Leistungskurs (LK)", "Grundkurs (GK)"],

  // ── INDIA — Class 11 fixes the stream, kept through Class 12 ─────────────
  "IN_Class 11": [
    "Science (PCM — Physics, Chemistry, Math)",
    "Science (PCB — Physics, Chemistry, Biology)",
    "Science (PCMB)",
    "Commerce",
    "Humanities / Arts",
  ],
  "IN_Class 12 (CBSE/NCERT)": [
    "Science (PCM — Physics, Chemistry, Math)",
    "Science (PCB — Physics, Chemistry, Biology)",
    "Science (PCMB)",
    "Commerce",
    "Humanities / Arts",
  ],

  // ── SPAIN — Modalidad chosen at 1º Bachillerato ──────────────────────────
  "ES_1º Bachillerato": [
    "Ciencias y Tecnología",
    "Humanidades y Ciencias Sociales",
    "Artes",
    "General",
  ],
  "ES_2º Bachillerato": [
    "Ciencias y Tecnología",
    "Humanidades y Ciencias Sociales",
    "Artes",
    "General",
  ],
  "ES_2º Bachillerato (EVAU)": [
    "Ciencias y Tecnología",
    "Humanidades y Ciencias Sociales",
    "Artes",
    "General",
  ],

  // ── ITALY — Liceo type ──────────────────────────────────────────────────
  "IT": [
    "Liceo Scientifico",
    "Liceo Scientifico — opzione Scienze Applicate",
    "Liceo Classico",
    "Liceo Linguistico",
    "Liceo delle Scienze Umane",
    "Istituto Tecnico — Informatica",
    "Istituto Tecnico — Economico",
  ],

  // ── EGYPT — Thanaweya Amma split ────────────────────────────────────────
  "EG_Grade 11": ["Scientific (Math)", "Scientific (Sciences)", "Literary"],
  "EG_Grade 12 (Thanaweya Amma)": [
    "Scientific — Mathematics section",
    "Scientific — Sciences section",
    "Literary section",
  ],

  // ── USA — track within high school ──────────────────────────────────────
  "US_Grade 11": ["Regular", "Honors", "AP track"],
  "US_Grade 12 (AP)": ["AP track", "Honors", "Regular"],

  // ── UK — A-level subject combination is the de facto track ───────────────
  // Left empty: A-level combinations are too combinatorial to enumerate;
  // students specify per-subject already.

  // ── Brazil, China, Japan, Korea, Canada, Australia — typically no
  //    section split that meaningfully changes the program; leave to free-text
  //    via the picker's "Other…" option.
};

export function sectionsFor(
  countryCode: string,
  gradeLevel?: string,
): string[] {
  const c = countryCode.toUpperCase();
  if (gradeLevel) {
    const exact = SECTIONS[`${c}_${gradeLevel}`];
    if (exact?.length) return exact;
  }
  return SECTIONS[c] ?? [];
}
