"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getClientAuth } from "@/lib/firebase";
import { formatAuthError } from "@/lib/firebaseErrors";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(getClientAuth(), email, password);
      router.replace("/study");
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-student-canvas px-6 py-16">
      <div className="w-full max-w-md rounded-2xl border border-student-border bg-student-card px-8 py-10 shadow-student">
        <h1 className="text-2xl font-semibold text-student-ink">Sign in</h1>
        <p className="mt-2 text-sm text-student-muted">
          Use the email and password you registered with.
        </p>
        <form onSubmit={(e) => void handleSubmit(e)} className="mt-8 space-y-4">
          <div>
            <label className="text-sm font-medium text-student-ink">Email</label>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-student-border px-3 py-2.5 text-student-ink focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-student-ink">
              Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-student-border px-3 py-2.5 text-student-ink focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-teal-600 py-3.5 text-base font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-student-muted">
          Need an account?{" "}
          <Link href="/register" className="font-medium text-teal-700 hover:underline">
            Create one
          </Link>
        </p>
        <p className="mt-4 text-center">
          <Link href="/" className="text-sm text-student-muted hover:text-student-ink">
            ← Back
          </Link>
        </p>
      </div>
    </main>
  );
}
