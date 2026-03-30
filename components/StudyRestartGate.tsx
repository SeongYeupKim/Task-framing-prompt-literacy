"use client";

import { useState } from "react";
import { formatAuthError } from "@/lib/firebaseErrors";

type Props = {
  emailHint: string;
  onKeepSubmission: () => void;
  onRestartWithPassword: (password: string) => Promise<void>;
};

export function StudyRestartGate({
  emailHint,
  onKeepSubmission,
  onRestartWithPassword,
}: Props) {
  const [step, setStep] = useState<"choose" | "password">("choose");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!password) {
      setError("Enter your account password.");
      return;
    }
    setBusy(true);
    try {
      await onRestartWithPassword(password);
      setPassword("");
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  if (step === "choose") {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-student-border bg-student-card px-8 py-10 shadow-student">
        <h1 className="text-xl font-semibold text-student-ink">
          Your study session is already on file
        </h1>
        <p className="mt-3 text-sm font-medium leading-relaxed text-student-ink">
          We already have a completed submission from this account. If you are
          logging back in after signing out, you can keep that submission as-is
          or start the study again from the beginning.
        </p>
        <p className="mt-4 text-sm font-medium leading-relaxed text-student-muted">
          Starting again will <strong className="text-student-ink">clear</strong>{" "}
          your previous answers for this research session so you can go through
          all steps once more. Your experimental group assignment will stay the
          same.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
          <button
            type="button"
            onClick={onKeepSubmission}
            className="rounded-2xl border border-student-border bg-white px-6 py-3 text-sm font-semibold text-student-ink transition hover:bg-student-canvas sm:order-2"
          >
            No — keep my submitted responses
          </button>
          <button
            type="button"
            onClick={() => {
              setError(null);
              setStep("password");
            }}
            className="rounded-2xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 sm:order-1"
          >
            Yes — restart from the beginning
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-student-border bg-student-card px-8 py-10 shadow-student">
      <h1 className="text-xl font-semibold text-student-ink">
        Confirm your password to restart
      </h1>
      <p className="mt-3 text-sm font-medium leading-relaxed text-student-muted">
        Enter the password for{" "}
        <span className="text-student-ink">{emailHint || "your account"}</span>{" "}
        to confirm you want to clear your saved responses and start over.
      </p>
      <form onSubmit={(e) => void submitPassword(e)} className="mt-6 space-y-4">
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
          <p className="text-sm font-medium text-red-600" role="alert">
            {error}
          </p>
        )}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setStep("choose");
              setPassword("");
              setError(null);
            }}
            className="rounded-2xl border border-student-border bg-white px-6 py-3 text-sm font-semibold text-student-ink hover:bg-student-canvas disabled:opacity-50"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={busy}
            className="rounded-2xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 disabled:opacity-50"
          >
            {busy ? "Verifying…" : "Restart study"}
          </button>
        </div>
      </form>
    </div>
  );
}
