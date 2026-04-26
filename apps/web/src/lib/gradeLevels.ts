/**
 * Grade levels per country, ordered from earliest (foundational) to latest
 * (final/exit year). Mirrors the `gradeLevels` arrays in
 * `functions/src/curriculaData.ts` so the frontend picker stays in sync with
 * the backend curriculum profile.
 */
export const GRADE_LEVELS_BY_COUNTRY: Record<string, string[]> = {
  FR: ["Seconde", "Première", "Terminale"],
  MA: ["Tronc commun", "1ère Bac", "2ème Bac"],
  TN: ["1ère secondaire", "2ème secondaire", "3ème secondaire", "4ème (Bac)"],
  US: ["Grade 9", "Grade 10", "Grade 11", "Grade 12 (AP)"],
  GB: ["GCSE", "AS-level", "A-level"],
  DE: ["Klasse 10", "Klasse 11", "Klasse 12", "Abitur"],
  IT: ["3ª Liceo", "4ª Liceo", "5ª Liceo Scientifico"],
  ES: ["1º Bachillerato", "2º Bachillerato (EVAU)"],
  EG: ["Grade 10", "Grade 11", "Grade 12 (Thanaweya Amma)"],
  IN: ["Class 11", "Class 12 (CBSE/NCERT)"],
  CN: ["高一 (Grade 10)", "高二 (Grade 11)", "高三 (Gaokao)"],
  JP: ["高1 (Grade 10)", "高2 (Grade 11)", "高3 (共通テスト)"],
  KR: ["고1 (Grade 10)", "고2 (Grade 11)", "고3 (수능)"],
  BR: ["1º ano EM", "2º ano EM", "3º ano EM (ENEM)"],
  CA: ["Grade 10", "Grade 11", "Grade 12"],
  AU: ["Year 11", "Year 12 (ATAR)"],
};

export function gradeLevelsFor(countryCode: string): string[] {
  return GRADE_LEVELS_BY_COUNTRY[countryCode.toUpperCase()] ?? [];
}
