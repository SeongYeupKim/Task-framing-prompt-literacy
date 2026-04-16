import type { DocumentData } from "firebase-admin/firestore";

function isFirestoreTimestamp(v: unknown): v is { toDate: () => Date } {
  return (
    v !== null &&
    typeof v === "object" &&
    typeof (v as { toDate?: unknown }).toDate === "function"
  );
}

/** Recursively turn Admin SDK Firestore values into JSON-safe plain objects. */
export function serializeAdminFirestoreValue(value: unknown): unknown {
  if (isFirestoreTimestamp(value)) {
    return value.toDate().toISOString();
  }
  if (Array.isArray(value)) {
    return value.map(serializeAdminFirestoreValue);
  }
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [
        k,
        serializeAdminFirestoreValue(v),
      ]),
    );
  }
  return value;
}

export function serializeAdminDoc(data: DocumentData): Record<string, unknown> {
  return serializeAdminFirestoreValue(data) as Record<string, unknown>;
}
