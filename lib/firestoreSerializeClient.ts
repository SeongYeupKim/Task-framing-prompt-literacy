import { Timestamp } from "firebase/firestore";

/** Turn Firestore client values (e.g. Timestamp) into JSON-safe data for download. */
export function serializeFirestoreValue(value: unknown): unknown {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  if (Array.isArray(value)) {
    return value.map(serializeFirestoreValue);
  }
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [
        k,
        serializeFirestoreValue(v),
      ]),
    );
  }
  return value;
}
