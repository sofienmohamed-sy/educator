import { initializeApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  connectAuthEmulator,
  type Auth,
} from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
  type Firestore,
} from "firebase/firestore";
import {
  getStorage,
  connectStorageEmulator,
  type FirebaseStorage,
} from "firebase/storage";
import {
  getFunctions,
  connectFunctionsEmulator,
  type Functions,
} from "firebase/functions";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.trim(),
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim(),
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim(),
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim(),
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim(),
  appId: import.meta.env.VITE_FIREBASE_APP_ID?.trim(),
};

export const isFirebaseConfigured = Boolean(
  config.apiKey && config.projectId && config.appId,
);

export const app: FirebaseApp = initializeApp(config);

let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _storage: FirebaseStorage | null = null;
let _functions: Functions | null = null;

try {
  _auth = getAuth(app);
  _db = getFirestore(app);
  _storage = getStorage(app);
  _functions = getFunctions(app, "us-central1");
} catch (err) {
  console.warn("[firebase] failed to initialize services", err);
}

export const auth = _auth!;
export const db = _db!;
export const storage = _storage!;
export const functions = _functions!;

const useEmulators =
  import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS !== "false";

if (useEmulators && _auth && _db && _storage && _functions) {
  try {
    connectAuthEmulator(_auth, "http://localhost:9099", { disableWarnings: true });
    connectFirestoreEmulator(_db, "localhost", 8080);
    connectStorageEmulator(_storage, "localhost", 9199);
    connectFunctionsEmulator(_functions, "localhost", 5001);
    console.info("[firebase] connected to local emulators");
  } catch (err) {
    console.warn("[firebase] failed to connect emulators", err);
  }
}
