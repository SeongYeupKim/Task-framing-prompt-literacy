import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

/** Trims accidental spaces from copy-paste (common cause of invalid-api-key). */
function e(key: string | undefined): string | undefined {
  if (key === undefined) return undefined;
  const t = key.trim();
  return t === "" ? undefined : t;
}

const firebaseConfig = {
  apiKey: e(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  authDomain: e(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
  projectId: e(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
  storageBucket: e(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: e(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
  appId: e(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
};

function getFirebaseApp(): FirebaseApp {
  if (getApps().length) return getApps()[0]!;
  return initializeApp(firebaseConfig);
}

export function getClientAuth(): Auth {
  return getAuth(getFirebaseApp());
}

export function getClientDb(): Firestore {
  return getFirestore(getFirebaseApp());
}
