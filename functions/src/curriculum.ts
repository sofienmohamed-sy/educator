import { getFirestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions/v2";
import { lookupStaticProfile } from "./curriculaData";
import {
  curriculumProfileSchema,
  type CurriculumProfile,
  type Subject,
} from "./schema";

/**
 * Resolve the curriculum profile for a (country, subject, gradeLevel, section)
 * tuple.
 *
 * Lookup order (zero-latency static map first, Firestore as override):
 *   1. Static map: subject + section overlay (if both provided)
 *   2. Static map: `{COUNTRYCODE}_{subject}` (subject-specific)
 *   3. Static map: `{COUNTRYCODE}` (country-level fallback)
 *   4. Firestore: `curricula/{COUNTRYCODE}` (manual override)
 *   5. null — caller falls back to Claude's built-in knowledge
 */
export async function getCurriculumProfile(
  countryCode: string,
  subject?: Subject,
  gradeLevel?: string,
  section?: string,
): Promise<CurriculumProfile | null> {
  const normalized = countryCode.trim().toUpperCase();
  if (!normalized) return null;

  const staticProfile = lookupStaticProfile(normalized, subject, gradeLevel, section);
  if (staticProfile) return staticProfile;

  try {
    const snap = await getFirestore()
      .collection("curricula")
      .doc(normalized)
      .get();

    if (!snap.exists) return null;

    const parsed = curriculumProfileSchema.safeParse({
      countryCode: normalized,
      ...snap.data(),
    });
    if (!parsed.success) {
      logger.warn("Invalid curriculum profile in Firestore", {
        countryCode: normalized,
        issues: parsed.error.issues,
      });
      return null;
    }
    return parsed.data;
  } catch (err) {
    logger.error("Failed to load curriculum profile", { countryCode, err });
    return null;
  }
}
