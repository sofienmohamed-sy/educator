import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";

import { updateProfileRequestSchema } from "./schema";

if (getApps().length === 0) initializeApp();

export const updateProfile = onCall(
  { region: "us-central1", memory: "256MiB", timeoutSeconds: 30 },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Sign in required.");
    }
    const uid = request.auth.uid;

    const parsed = updateProfileRequestSchema.safeParse(request.data);
    if (!parsed.success) {
      throw new HttpsError(
        "invalid-argument",
        `Invalid request: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`,
      );
    }

    await getFirestore()
      .collection("users")
      .doc(uid)
      .set(
        { ...parsed.data, updatedAt: FieldValue.serverTimestamp() },
        { merge: true },
      );

    return { ok: true };
  },
);

export const getProfile = onCall(
  { region: "us-central1", memory: "256MiB", timeoutSeconds: 30 },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Sign in required.");
    }
    const snap = await getFirestore()
      .collection("users")
      .doc(request.auth.uid)
      .get();
    return snap.exists ? snap.data() : null;
  },
);
