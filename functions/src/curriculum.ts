import { getFirestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions/v2";
import { curriculumProfileSchema, type CurriculumProfile } from "./schema";

/**
 * Fetch the curated curriculum profile for a country, if one has been seeded
 * into Firestore. Returns `null` when none exists — the caller should then
 * fall back to Claude's built-in knowledge.
 */
export async function getCurriculumProfile(
  countryCode: string,
): Promise<CurriculumProfile | null> {
  const normalized = countryCode.trim().toUpperCase();
  if (!normalized) return null;

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
