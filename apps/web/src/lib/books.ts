import { ref, uploadBytes } from "firebase/storage";
import { storage } from "../firebase";
import { createBookFn } from "./callables";
import type { Subject } from "./types";

export async function uploadBook(
  meta: {
    title: string;
    subject: Subject;
    country: string;
    gradeLevel?: string;
    language?: string;
  },
  file: File,
): Promise<string> {
  const { data } = await createBookFn(meta);
  const { bookId, uploadPath } = data;
  const storageRef = ref(storage, uploadPath);
  await uploadBytes(storageRef, file, { contentType: "application/pdf" });
  return bookId;
}
