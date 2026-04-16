import { isPennStateEmail } from "@/lib/psuEmail";

/** Firebase email for auto sign-in after dashboard login (same password as dashboard). */
export function resolveBridgeFirebaseEmail(username: string): string | null {
  const envEmail = process.env.ADMIN_EXPORT_FIREBASE_EMAIL?.trim();
  if (envEmail) {
    return isPennStateEmail(envEmail) ? envEmail.toLowerCase() : null;
  }
  const u = username.trim();
  if (!u) return null;
  if (u.includes("@")) {
    return isPennStateEmail(u) ? u.trim().toLowerCase() : null;
  }
  const derived = `${u}@psu.edu`;
  return isPennStateEmail(derived) ? derived : null;
}
