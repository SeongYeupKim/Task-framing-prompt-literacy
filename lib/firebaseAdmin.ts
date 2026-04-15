import * as admin from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { getFirebaseServiceAccountJson } from "@/lib/serverEnv";

let app: admin.app.App | undefined;

function getServiceAccount(): admin.ServiceAccount {
  const raw = getFirebaseServiceAccountJson();
  if (!raw) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_JSON is not set. Add the service account JSON in Vercel (or .env.local for local testing).",
    );
  }
  return JSON.parse(raw) as admin.ServiceAccount;
}

/** Server-only Firebase Admin app (Firestore). Lazy init so builds work without env. */
export function getAdminApp(): admin.app.App {
  if (app) return app;
  if (admin.apps.length > 0) {
    app = admin.apps[0]!;
    return app;
  }
  app = admin.initializeApp({
    credential: admin.credential.cert(getServiceAccount()),
  });
  return app;
}

export function getAdminFirestore(): admin.firestore.Firestore {
  return getAdminApp().firestore();
}

/** Convert Firestore Timestamps (and nested values) to ISO strings for JSON export. */
export function deepSerializeFirestore<T>(value: T): unknown {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  if (Array.isArray(value)) {
    return value.map((v) => deepSerializeFirestore(v));
  }
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [
        k,
        deepSerializeFirestore(v),
      ]),
    );
  }
  return value;
}
