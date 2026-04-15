"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { FirebaseError } from "firebase/app";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { getClientAuth, getClientDb } from "@/lib/firebase";
import { formatAuthError } from "@/lib/firebaseErrors";
import type { AdminExportPayload } from "@/lib/adminExportFormat";
import {
  downloadBlob,
  participantsToChatTranscript,
  participantsToCsv,
} from "@/lib/adminExportFormat";
import { summarizeExport, type ExportSummary } from "@/lib/adminExportSummary";
import { serializeFirestoreValue } from "@/lib/firestoreSerializeClient";
import { isPennStateEmail } from "@/lib/psuEmail";

function formatExportError(err: unknown): string {
  if (err instanceof FirebaseError && err.code === "permission-denied") {
    return "Firestore permission denied. Publish the repo’s firestore.rules to this Firebase project (see README), then try again.";
  }
  if (err instanceof Error) return err.message;
  return "Could not read Firestore. Check rules and researcher access.";
}

export default function AdminDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AdminExportPayload | null>(null);
  const [summary, setSummary] = useState<ExportSummary | null>(null);

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() ?? "";
  const consoleFirestoreUrl = projectId
    ? `https://console.firebase.google.com/project/${projectId}/firestore`
    : "https://console.firebase.google.com";

  useEffect(() => {
    const auth = getClientAuth();
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
    });
  }, []);

  const handleSignIn = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      if (!isPennStateEmail(email)) {
        setError("Use your Penn State @psu.edu account.");
        return;
      }
      setLoading(true);
      try {
        await signInWithEmailAndPassword(getClientAuth(), email, password);
        setPassword("");
      } catch (err) {
        setError(formatAuthError(err));
      } finally {
        setLoading(false);
      }
    },
    [email, password],
  );

  const runExport = useCallback(async () => {
    if (!user) return;
    setError(null);
    setData(null);
    setSummary(null);
    setLoading(true);
    try {
      const snap = await getDocs(collection(getClientDb(), "users"));
      const participants = snap.docs.map((d) => ({
        uid: d.id,
        ...(serializeFirestoreValue(d.data()) as Record<string, unknown>),
      }));
      setData({
        exportedAt: new Date().toISOString(),
        projectId: projectId || null,
        participantCount: participants.length,
        participants,
      });
      setSummary(summarizeExport(participants));
    } catch (err) {
      setError(formatExportError(err));
    } finally {
      setLoading(false);
    }
  }, [user, projectId]);

  const stamp = data?.exportedAt
    ? data.exportedAt.replace(/[:.]/g, "-").slice(0, 19)
    : "export";

  const phaseLabels: Record<string, string> = {
    study_consent: "Consent",
    study_overview: "Overview",
    ai_acceptance: "AI acceptance",
    training: "Instruction",
    task_intro_eval: "Intro (eval)",
    eval1: "Eval 1",
    task_intro_final: "Intro (final)",
    genai: "GenAI chat",
    essay: "Essay",
    demographics: "Demographics",
    complete: "Complete",
  };

  return (
    <div className="min-h-screen bg-student-canvas px-4 py-8 pb-16 text-student-ink sm:px-6">
      <div className="mx-auto max-w-3xl">
        <header className="border-b border-student-border pb-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-student-muted">
            Researcher
          </p>
          <div className="mt-1 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Data export dashboard
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-student-muted">
                Sign in with a @psu.edu study account. Export runs in your
                browser from Firestore (no server-side Firebase Admin). Includes
                full{" "}
                <span className="text-student-ink">genaiMessages</span> chat
                logs.
              </p>
            </div>
            {user && (
              <button
                type="button"
                onClick={() => void signOut(getClientAuth())}
                className="shrink-0 rounded-xl border border-student-border bg-white px-4 py-2 text-sm font-semibold text-student-ink shadow-sm hover:bg-student-canvas"
              >
                Sign out
              </button>
            )}
          </div>
        </header>

        <details className="mt-8 rounded-2xl border border-amber-200/90 bg-gradient-to-br from-amber-50 to-orange-50/40 px-5 py-4 text-sm text-amber-950 shadow-student">
          <summary className="cursor-pointer font-semibold text-amber-900">
            Setup: Firestore rules (one time)
          </summary>
          <ol className="mt-4 list-decimal space-y-3 pl-5 leading-relaxed">
            <li>
              In{" "}
              <a
                className="font-medium text-teal-800 underline"
                href={consoleFirestoreUrl}
                target="_blank"
                rel="noreferrer"
              >
                Firebase Console → Firestore → Rules
              </a>
              , paste the contents of{" "}
              <code className="rounded bg-white/90 px-1.5 py-0.5 text-xs">
                firestore.rules
              </code>{" "}
              from this repo and <strong>Publish</strong>.
            </li>
            <li>
              Register at{" "}
              <Link
                href="/register"
                className="font-medium text-teal-800 underline"
              >
                /register
              </Link>{" "}
              if you need an account for sign-in below.
            </li>
          </ol>
        </details>

        {!authReady ? (
          <p className="mt-10 text-sm text-student-muted">Loading…</p>
        ) : !user ? (
          <form
            onSubmit={(e) => void handleSignIn(e)}
            className="mt-8 rounded-2xl border border-student-border bg-student-card p-6 shadow-student sm:p-8"
          >
            <h2 className="text-lg font-semibold text-student-ink">
              Researcher sign-in
            </h2>
            <label className="mt-5 block text-sm font-semibold text-student-ink">
              Email
            </label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-student-border px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              placeholder="you@psu.edu"
              required
            />
            <label className="mt-4 block text-sm font-semibold text-student-ink">
              Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-student-border px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-2xl bg-teal-600 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
            {error && (
              <p className="mt-4 text-sm font-medium text-red-600" role="alert">
                {error}
              </p>
            )}
          </form>
        ) : (
          <div className="mt-8 space-y-5 rounded-2xl border border-student-border bg-student-card p-6 shadow-student sm:p-8">
            <p className="text-sm">
              <span className="text-student-muted">Signed in as </span>
              <span className="font-medium text-student-ink">
                {user.email ?? user.uid}
              </span>
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                disabled={loading}
                onClick={() => void runExport()}
                className="flex-1 rounded-2xl bg-teal-600 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 disabled:opacity-50"
              >
                {loading ? "Loading…" : data ? "Refresh export" : "Load export from Firestore"}
              </button>
            </div>
            {error && (
              <p className="text-sm font-medium text-red-600" role="alert">
                {error}
              </p>
            )}
          </div>
        )}

        {summary && data && (
          <div className="mt-6 rounded-2xl border border-student-border bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-student-muted">
              Snapshot
            </p>
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-student-muted">Participants</dt>
                <dd className="text-lg font-semibold text-student-ink">
                  {summary.total}
                </dd>
              </div>
              <div>
                <dt className="text-student-muted">Reached complete</dt>
                <dd className="text-lg font-semibold text-student-ink">
                  {summary.complete}
                </dd>
              </div>
              <div>
                <dt className="text-student-muted">With essay text</dt>
                <dd className="text-lg font-semibold text-student-ink">
                  {summary.withEssay}
                </dd>
              </div>
              <div>
                <dt className="text-student-muted">With chat messages</dt>
                <dd className="text-lg font-semibold text-student-ink">
                  {summary.withChat}
                </dd>
              </div>
            </dl>
            <div className="mt-4 border-t border-student-border pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-student-muted">
                By phase
              </p>
              <ul className="mt-2 flex flex-wrap gap-2 text-xs">
                {Object.entries(summary.byPhase)
                  .sort((a, b) => b[1] - a[1])
                  .map(([phase, n]) => (
                    <li
                      key={phase}
                      className="rounded-full border border-student-border bg-student-canvas px-2.5 py-1 font-medium"
                    >
                      {phaseLabels[phase] ?? phase}: {n}
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        )}

        {data && (
          <div className="mt-6 space-y-4 rounded-2xl border border-teal-200 bg-teal-50/50 p-6 shadow-sm sm:p-8">
            <p className="text-sm font-medium text-teal-900">
              <span className="font-semibold">{data.participantCount}</span>{" "}
              row{data.participantCount === 1 ? "" : "s"} · exported{" "}
              {new Date(data.exportedAt).toLocaleString()}
              {data.projectId ? (
                <>
                  {" "}
                  ·{" "}
                  <span className="font-mono text-xs">{data.projectId}</span>
                </>
              ) : null}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={() =>
                  downloadBlob(
                    `task-framing-export-${stamp}.json`,
                    JSON.stringify(data, null, 2),
                    "application/json",
                  )
                }
                className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
              >
                Download JSON (full)
              </button>
              <button
                type="button"
                onClick={() =>
                  downloadBlob(
                    `task-framing-export-${stamp}.csv`,
                    participantsToCsv(data.participants),
                    "text/csv;charset=utf-8",
                  )
                }
                className="rounded-xl border border-teal-700 bg-white px-4 py-2.5 text-sm font-semibold text-teal-900 hover:bg-teal-50"
              >
                Download CSV
              </button>
              <button
                type="button"
                onClick={() =>
                  downloadBlob(
                    `task-framing-chat-logs-${stamp}.txt`,
                    participantsToChatTranscript(data.participants),
                    "text/plain;charset=utf-8",
                  )
                }
                className="rounded-xl border border-teal-700 bg-white px-4 py-2.5 text-sm font-semibold text-teal-900 hover:bg-teal-50"
              >
                Download chat transcripts (.txt)
              </button>
            </div>
            <p className="text-xs leading-relaxed text-teal-900/85">
              CSV keeps nested fields (e.g. <code className="rounded bg-white/70 px-1">genaiMessages</code>) as JSON in cells. The .txt file is readable chat only.
            </p>
          </div>
        )}

        <p className="mt-12 text-center text-sm text-student-muted">
          <Link href="/" className="font-medium text-teal-700 hover:underline">
            Back to study home
          </Link>
        </p>
      </div>
    </div>
  );
}
