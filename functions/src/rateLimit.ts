import { getFirestore } from "firebase-admin/firestore";
import { HttpsError } from "firebase-functions/v2/https";

/**
 * Enforce a per-user rolling-hour rate limit for a named operation.
 * Timestamps are stored in `users/{uid}/_meta/{operation}` under the key
 * matching the operation name. Each operation has its own independent counter.
 */
export async function enforceRateLimit(
  uid: string,
  operation: string,
  maxPerHour: number,
): Promise<void> {
  const db = getFirestore();
  const ref = db
    .collection("users")
    .doc(uid)
    .collection("_meta")
    .doc(operation);
  const now = Date.now();
  const windowStart = now - 60 * 60 * 1000;

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const existing = (snap.data()?.timestamps as number[] | undefined) ?? [];
    const recent = existing.filter((t) => t >= windowStart);
    if (recent.length >= maxPerHour) {
      throw new HttpsError(
        "resource-exhausted",
        `Rate limit reached: ${maxPerHour} ${operation} operations per hour.`,
      );
    }
    recent.push(now);
    tx.set(ref, { timestamps: recent }, { merge: true });
  });
}
