import type { AuthError } from "firebase/auth";

/**
 * Maps Firebase Auth error codes to readable messages (and fixes misleading generic copy).
 */
export function formatAuthError(err: unknown): string {
  const code =
    err && typeof err === "object" && "code" in err
      ? String((err as AuthError).code)
      : "";

  const messages: Record<string, string> = {
    "auth/email-already-in-use":
      "This email is already registered. Use “Log in” instead, or try another email.",
    "auth/invalid-email": "That email address doesn’t look valid.",
    "auth/weak-password":
      "Password is too weak. Use at least 8 characters with a mix of characters.",
    "auth/operation-not-allowed":
      "Email/password sign-in is turned off in Firebase. In Firebase Console → Authentication → Sign-in method, enable Email/Password.",
    "auth/invalid-api-key":
      "Firebase API key doesn’t match this project. Check NEXT_PUBLIC_FIREBASE_* in Vercel (or .env.local) matches Firebase → Project settings.",
    "auth/network-request-failed":
      "Network error. Check your connection, VPN, or try again.",
    "auth/too-many-requests":
      "Too many attempts. Wait several minutes, then try again.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/user-not-found": "No account found with this email. Register first.",
    "auth/wrong-password": "Wrong password.",
    "auth/invalid-credential": "Wrong email or password.",
    "auth/admin-restricted-operation":
      "This sign-in method is restricted in Firebase project settings.",
  };

  if (code && messages[code]) return messages[code];

  if (code) {
    return `Sign-in error: ${code}. If this persists, confirm Email/Password is enabled in Firebase and env vars match your Firebase project (especially on Vercel).`;
  }

  if (err instanceof Error && err.message) return err.message;
  return "Something went wrong. Please try again.";
}
