import { Buffer } from "node:buffer";
import type { ServiceAccount } from "firebase-admin";

/**
 * Read Vercel / Node env at runtime. Next.js may inline `process.env.FOO` at
 * build time as `undefined` if FOO was missing during `next build`, which
 * breaks vars added only in the Vercel dashboard. Decoding the key at runtime
 * avoids that static replacement.
 */
function envFromKeyB64(keyB64: string): string | undefined {
  const k = Buffer.from(keyB64, "base64").toString("utf8");
  const v = process.env[k];
  return typeof v === "string" ? v : undefined;
}

/** Second lookup path: key built from char codes (bundler cannot fold to undefined). */
function envChar(...codes: readonly number[]): string | undefined {
  const k = String.fromCharCode(...codes);
  const v = process.env[k];
  return typeof v === "string" ? v : undefined;
}

/** ADMIN_EXPORT_SECRET (and typo ADIM_EXPORT_SECRET) */
export function getAdminExportSecret(): string {
  const primary =
    envFromKeyB64("QURNSU5fRVhQT1JUX1NFQ1JFVA==")?.trim() ??
    envChar(
      65, 68, 77, 73, 78, 95, 69, 88, 80, 79, 82, 84, 95, 83, 69, 67, 82, 69,
      84,
    )?.trim();
  if (primary) return primary;
  const typo =
    envFromKeyB64("QURJTV9FWFBPUlRfU0VDUkVU")?.trim() ??
    envChar(
      65, 68, 73, 77, 95, 69, 88, 80, 79, 82, 84, 95, 83, 69, 67, 82, 69, 84,
    )?.trim();
  if (typo) return typo;
  return "";
}

function readFirebaseServiceAccountJsonRaw(): string {
  const raw =
    envFromKeyB64("RklSRUJBU0VfU0VSVklDRV9BQ0NPVU5UX0pTT04=") ??
    envChar(
      70, 73, 82, 69, 66, 65, 83, 69, 95, 83, 69, 82, 86, 73, 67, 69, 95, 65,
      67, 67, 79, 85, 78, 84, 95, 74, 83, 79, 78,
    );
  return raw?.trim().replace(/^\uFEFF/, "") ?? "";
}

/** Full service account JSON (one line), if set */
export function getFirebaseServiceAccountJson(): string {
  return readFirebaseServiceAccountJsonRaw();
}

function readAdminProjectId(): string {
  return (
    envFromKeyB64("RklSRUJBU0VfQURNSU5fUFJPSkVDVF9JRA==") ??
    envChar(
      70, 73, 82, 69, 66, 65, 83, 69, 95, 65, 68, 77, 73, 78, 95, 80, 82, 79,
      74, 69, 67, 84, 95, 73, 68,
    )
  )?.trim() ?? "";
}

function readAdminClientEmail(): string {
  return (
    envFromKeyB64("RklSRUJBU0VfQURNSU5fQ0xJRU5UX0VNQUlM") ??
    envChar(
      70, 73, 82, 69, 66, 65, 83, 69, 95, 65, 68, 77, 73, 78, 95, 67, 76, 73,
      69, 78, 84, 95, 69, 77, 65, 73, 76,
    )
  )?.trim() ?? "";
}

function readAdminPrivateKeyRaw(): string {
  return (
    envFromKeyB64("RklSRUJBU0VfQURNSU5fUFJJVkFURV9LRVk=") ??
    envChar(
      70, 73, 82, 69, 66, 65, 83, 69, 95, 65, 68, 77, 73, 78, 95, 80, 82, 73,
      86, 65, 84, 69, 95, 75, 69, 89,
    )
  )?.trim() ?? "";
}

/** Safe booleans for support / admin UI (no secret values). */
export function getFirebaseCredentialEnvPresence(): {
  hasFullJson: boolean;
  hasProjectId: boolean;
  hasClientEmail: boolean;
  hasPrivateKey: boolean;
} {
  const json = readFirebaseServiceAccountJsonRaw();
  const pk = readAdminPrivateKeyRaw();
  return {
    hasFullJson: json.length > 0,
    hasProjectId: readAdminProjectId().length > 0,
    hasClientEmail: readAdminClientEmail().length > 0,
    hasPrivateKey: pk.length > 0,
  };
}

/**
 * Credentials for firebase-admin. Use either:
 * - FIREBASE_SERVICE_ACCOUNT_JSON — entire key file as one line (`jq -c . key.json`), or
 * - FIREBASE_ADMIN_PROJECT_ID + FIREBASE_ADMIN_CLIENT_EMAIL + FIREBASE_ADMIN_PRIVATE_KEY
 *   (easier in Vercel; for private_key, paste the PEM with newline characters as the two-char sequence \n).
 */
export function resolveFirebaseServiceAccount(): ServiceAccount {
  const jsonRaw = readFirebaseServiceAccountJsonRaw();
  if (jsonRaw) {
    try {
      return JSON.parse(jsonRaw) as ServiceAccount;
    } catch {
      throw new Error(
        "FIREBASE_SERVICE_ACCOUNT_JSON is set but is not valid JSON. Paste the downloaded key as one minified line (e.g. jq -c . serviceAccount.json).",
      );
    }
  }

  const projectId = readAdminProjectId();
  const clientEmail = readAdminClientEmail();
  let privateKey = readAdminPrivateKeyRaw();

  if (privateKey) {
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  const splitCount = [projectId, clientEmail, privateKey].filter(Boolean).length;
  if (splitCount === 3) {
    return { projectId, clientEmail, privateKey };
  }
  if (splitCount > 0) {
    throw new Error(
      "Firebase Admin split env vars are incomplete. Set all three: FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY (or use only FIREBASE_SERVICE_ACCOUNT_JSON).",
    );
  }

  throw new Error(
    "Firebase Admin is not configured. In Vercel → Environment Variables (Production), add either: (1) FIREBASE_SERVICE_ACCOUNT_JSON = full contents of the downloaded service account JSON as one line, or (2) FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY from that same file (private key: use \\n where line breaks were). Create a key: Firebase Console → Project settings → Service accounts → Generate new private key.",
  );
}
