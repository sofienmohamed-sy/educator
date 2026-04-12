import { ref, uploadBytes } from "firebase/storage";
import { storage } from "../firebase";

/**
 * Upload a user-provided file to `uploads/{uid}/{randomId}-{name}` and return
 * the Storage path the Cloud Function will read from.
 */
export async function uploadProblemFile(uid: string, file: File): Promise<string> {
  const id = crypto.randomUUID();
  const safeName = file.name.replace(/[^\w.-]/g, "_");
  const path = `uploads/${uid}/${id}-${safeName}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return path;
}

export function fileContentType(file: File): string {
  // Firefox/Safari sometimes report empty type for PDFs picked by accept=application/pdf
  if (!file.type && /\.pdf$/i.test(file.name)) return "application/pdf";
  return file.type || "application/octet-stream";
}
