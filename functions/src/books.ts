import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/v2";

import {
  createBookRequestSchema,
  listBooksRequestSchema,
  type CreateBookRequest,
  type ListBooksRequest,
} from "./schema";

if (getApps().length === 0) initializeApp();

async function assertProfessor(uid: string): Promise<void> {
  const snap = await getFirestore().collection("users").doc(uid).get();
  if (snap.data()?.role !== "professor") {
    throw new HttpsError("permission-denied", "Professor role required.");
  }
}

/**
 * Professor creates a book metadata record and receives the Storage upload path.
 * After calling this, the client uploads the PDF to `uploadPath` in Firebase Storage.
 * The Storage trigger `processBookOnUpload` then fires automatically.
 */
export const createBook = onCall(
  { region: "us-central1", memory: "256MiB", timeoutSeconds: 30 },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Sign in required.");
    }
    const uid = request.auth.uid;
    await assertProfessor(uid);

    const parsed = createBookRequestSchema.safeParse(request.data);
    if (!parsed.success) {
      throw new HttpsError(
        "invalid-argument",
        `Invalid request: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`,
      );
    }
    const req: CreateBookRequest = parsed.data;

    const db = getFirestore();
    const ref = db.collection("books").doc();
    const bookId = ref.id;
    const storagePath = `books/${bookId}/original.pdf`;

    await ref.set({
      title: req.title,
      subject: req.subject,
      country: req.country,
      gradeLevel: req.gradeLevel ?? null,
      language: req.language ?? null,
      storagePath,
      uploadedBy: uid,
      status: "pending",
      chunkCount: null,
      errorMessage: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return { bookId, uploadPath: storagePath };
  },
);

/** List books available to authenticated users. */
export const listBooks = onCall(
  { region: "us-central1", memory: "256MiB", timeoutSeconds: 30 },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Sign in required.");
    }
    const uid = request.auth.uid;

    const parsed = listBooksRequestSchema.safeParse(request.data ?? {});
    if (!parsed.success) {
      throw new HttpsError(
        "invalid-argument",
        `Invalid request: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`,
      );
    }
    const req: ListBooksRequest = parsed.data;

    // Check if caller is a professor (they can see their own non-ready books)
    const profileSnap = await getFirestore().collection("users").doc(uid).get();
    const isProfessor = profileSnap.data()?.role === "professor";

    const db = getFirestore();
    let query = db.collection("books").orderBy("createdAt", "desc");

    if (req.subject) {
      query = query.where("subject", "==", req.subject) as typeof query;
    }
    if (req.country) {
      query = query.where("country", "==", req.country) as typeof query;
    }

    let snap;
    try {
      snap = await query.limit(50).get();
    } catch (err) {
      logger.error("listBooks Firestore query failed", {
        uid,
        subject: req.subject,
        country: req.country,
        error: err instanceof Error ? err.message : String(err),
      });
      throw new HttpsError("internal", "Failed to load books.");
    }
    const books = snap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((book) => {
        const data = book as unknown as { status: string; uploadedBy: string };
        // Everyone sees ready books; professors see their own books at any status
        return (
          data.status === "ready" || (isProfessor && data.uploadedBy === uid)
        );
      });

    return { books };
  },
);
