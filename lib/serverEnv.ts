import { Buffer } from "node:buffer";

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

/** ADMIN_EXPORT_SECRET (and typo ADIM_EXPORT_SECRET) */
export function getAdminExportSecret(): string {
  const primary = envFromKeyB64("QURNSU5fRVhQT1JUX1NFQ1JFVA==")?.trim();
  if (primary) return primary;
  const typo = envFromKeyB64("QURJTV9FWFBPUlRfU0VDUkVU")?.trim();
  if (typo) return typo;
  return "";
}

/** FIREBASE_SERVICE_ACCOUNT_JSON */
export function getFirebaseServiceAccountJson(): string {
  return (
    envFromKeyB64("RklSRUJBU0VfU0VSVklDRV9BQ0NPVU5UX0pTT04=")?.trim() ?? ""
  );
}
