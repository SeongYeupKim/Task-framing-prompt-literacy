/**
 * Firebase Auth email used for browser-side export (after /admin login).
 * Must stay in sync with firestore.rules `isExportAccount()` (same address).
 *
 * Optional override: NEXT_PUBLIC_RESEARCH_EXPORT_EMAIL (then edit rules to match).
 */
export const RESEARCH_EXPORT_FIREBASE_EMAIL =
  process.env.NEXT_PUBLIC_RESEARCH_EXPORT_EMAIL?.trim().toLowerCase() ||
  "admin@psu.edu";
