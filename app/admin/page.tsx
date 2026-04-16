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
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { downloadBlob } from "@/lib/adminExportFormat";
import { buildStudyWideExportCsv } from "@/lib/studyWideExportCsv";
import { getClientAuth, getClientDb } from "@/lib/firebase";
import { formatAuthError } from "@/lib/firebaseErrors";
import { serializeFirestoreValue } from "@/lib/firestoreSerializeClient";
import { isPennStateEmail } from "@/lib/psuEmail";

const SESSION_KEY = "taskFramingAdminSession";

type SessionCreds = { username: string; password: string };

function readSession(): SessionCreds | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as SessionCreds;
    if (
      typeof p.username === "string" &&
      typeof p.password === "string" &&
      p.username.length > 0
    ) {
      return p;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function writeSession(c: SessionCreds) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(c));
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

function formatClientExportError(err: unknown): string {
  if (err instanceof FirebaseError && err.code === "permission-denied") {
    return "Firestore permission denied. Publish firestore.rules from this repo and add researchers/{your UID}.";
  }
  if (err instanceof Error) return err.message;
  return "Export failed.";
}

export default function AdminDashboardPage() {
  const [authed, setAuthed] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [exportHint, setExportHint] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [serverExportEnabled, setServerExportEnabled] = useState<
    boolean | null
  >(null);

  const [fbEmail, setFbEmail] = useState("");
  const [fbPassword, setFbPassword] = useState("");
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [fbReady, setFbReady] = useState(false);
  const [researcherOk, setResearcherOk] = useState<boolean | null>(null);
  const [fbError, setFbError] = useState<string | null>(null);

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() ?? "";
  const consoleUrl = projectId
    ? `https://console.firebase.google.com/project/${projectId}/firestore`
    : "https://console.firebase.google.com";

  useEffect(() => {
    const s = readSession();
    if (s) {
      setUsername(s.username);
      setPassword(s.password);
      setAuthed(true);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    const auth = getClientAuth();
    return onAuthStateChanged(auth, (u) => {
      setFirebaseUser(u);
      setFbReady(true);
    });
  }, []);

  useEffect(() => {
    if (!authed) {
      setServerExportEnabled(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/admin/export-capability");
        const data = (await res.json()) as { serverExportEnabled?: boolean };
        if (!cancelled) {
          setServerExportEnabled(!!data.serverExportEnabled);
        }
      } catch {
        if (!cancelled) setServerExportEnabled(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authed]);

  useEffect(() => {
    if (!firebaseUser) {
      setResearcherOk(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const ref = doc(getClientDb(), "researchers", firebaseUser.uid);
        const snap = await getDoc(ref);
        if (!cancelled) setResearcherOk(snap.exists());
      } catch {
        if (!cancelled) setResearcherOk(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [firebaseUser]);

  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setBusy(true);
      try {
        const res = await fetch("/api/admin/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          ok?: boolean;
          error?: string;
        };
        if (!res.ok) {
          setError(data.error ?? "Login failed.");
          return;
        }
        writeSession({ username, password });
        setAuthed(true);
      } catch {
        setError("Network error. Try again.");
      } finally {
        setBusy(false);
      }
    },
    [username, password],
  );

  const handleLogout = useCallback(() => {
    clearSession();
    setAuthed(false);
    setPassword("");
    setExportHint(null);
    setServerExportEnabled(null);
    setError(null);
  }, []);

  const handleDownloadCsvServer = useCallback(async () => {
    const s = readSession();
    const u = s?.username ?? username;
    const p = s?.password ?? password;
    if (!u || !p) {
      setError("Sign in again to download.");
      setAuthed(false);
      return;
    }
    setError(null);
    setExportHint(null);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/export-csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u, password: p }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as {
          error?: string;
          code?: string;
        };
        setError(j.error ?? `Export failed (${res.status}).`);
        return;
      }
      const blob = await res.blob();
      const cd = res.headers.get("Content-Disposition");
      let name = `task-framing-study-wide-${new Date().toISOString().slice(0, 10)}.csv`;
      const m = cd?.match(/filename="([^"]+)"/);
      if (m?.[1]) name = m[1];
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      a.click();
      URL.revokeObjectURL(url);
      setExportHint(
        "Download started. One wide CSV: all arms share columns; unused fields are blank.",
      );
    } catch {
      setError("Could not download export.");
    } finally {
      setBusy(false);
    }
  }, [username, password]);

  const handleFirebaseSignIn = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setFbError(null);
      if (!isPennStateEmail(fbEmail)) {
        setFbError("Use your @psu.edu account.");
        return;
      }
      setBusy(true);
      try {
        await signInWithEmailAndPassword(
          getClientAuth(),
          fbEmail,
          fbPassword,
        );
        setFbPassword("");
      } catch (err) {
        setFbError(formatAuthError(err));
      } finally {
        setBusy(false);
      }
    },
    [fbEmail, fbPassword],
  );

  const handleClientExportCsv = useCallback(async () => {
    if (!firebaseUser || !researcherOk) return;
    setFbError(null);
    setExportHint(null);
    setBusy(true);
    try {
      const snap = await getDocs(collection(getClientDb(), "users"));
      const participants = snap.docs.map((d) => ({
        uid: d.id,
        ...(serializeFirestoreValue(d.data()) as Record<string, unknown>),
      }));
      const csv = buildStudyWideExportCsv(participants);
      const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      downloadBlob(`task-framing-study-wide-${stamp}.csv`, csv, "text/csv;charset=utf-8");
      setExportHint(
        "Browser export complete (same wide CSV as server export).",
      );
    } catch (err) {
      setFbError(formatClientExportError(err));
    } finally {
      setBusy(false);
    }
  }, [firebaseUser, researcherOk]);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-student-canvas text-student-muted">
        <p className="text-sm">Loading…</p>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-student-canvas px-4 py-10 text-student-ink sm:px-6">
        <div className="mx-auto max-w-md rounded-2xl border border-student-border bg-white p-8 shadow-student">
          <h1 className="text-center text-2xl font-semibold tracking-tight">
            Researcher export
          </h1>
          <p className="mt-2 text-center text-sm text-student-muted">
            Sign in to download participant data (wide CSV).
          </p>
          <form onSubmit={(e) => void handleLogin(e)} className="mt-8 space-y-4">
            <div>
              <label className="block text-sm font-semibold">Username</label>
              <input
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-student-border px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">Password</label>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-student-border px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                required
              />
            </div>
            {error && (
              <p className="text-sm font-medium text-red-600" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-2xl bg-teal-600 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
            >
              {busy ? "Checking…" : "Sign in"}
            </button>
          </form>
          <p className="mt-8 text-center text-sm text-student-muted">
            <Link href="/" className="font-medium text-teal-700 hover:underline">
              Back to study home
            </Link>
          </p>
        </div>
      </div>
    );
  }

  const showServerExport = serverExportEnabled === true;
  const showBrowserExport =
    serverExportEnabled === false || serverExportEnabled === null;

  return (
    <div className="min-h-screen bg-student-canvas px-4 py-8 pb-16 text-student-ink sm:px-6">
      <div className="mx-auto max-w-2xl">
        <div className="flex flex-col gap-4 border-b border-student-border pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-student-muted">
              Researcher
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Data export
            </h1>
            <p className="mt-2 text-sm text-student-muted">
              Wide spreadsheet: columns follow the full-intervention arm; control /
              instruction cells stay empty where those tasks did not apply. Essay
              comes before <code className="text-xs">st_1</code>,{" "}
              <code className="text-xs">ai_1</code>, … chat turns from the main
              GenAI task; demographics are last.
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="shrink-0 rounded-xl border border-student-border bg-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-student-canvas"
          >
            Log out
          </button>
        </div>

        <div className="mt-8 rounded-2xl border border-student-border bg-student-card p-6 shadow-student sm:p-8">
          <p className="text-sm">
            <span className="text-student-muted">Dashboard login: </span>
            <span className="font-medium">{username}</span>
          </p>

          {serverExportEnabled === null && (
            <p className="mt-4 text-sm text-student-muted">Checking export options…</p>
          )}

          {showServerExport && (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={() => void handleDownloadCsvServer()}
                className="mt-6 w-full rounded-2xl bg-teal-600 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 disabled:opacity-50"
              >
                {busy ? "Preparing CSV…" : "Download all participants (server CSV)"}
              </button>
              <p className="mt-3 text-xs text-student-muted">
                Uses Firebase Admin on Vercel. Same file format as browser export.
              </p>
            </>
          )}

          {showBrowserExport && serverExportEnabled !== null && (
            <div className="mt-6 rounded-xl border border-teal-200 bg-teal-50/60 p-4 sm:p-5">
              <p className="text-sm font-semibold text-teal-950">
                Browser export (no service account on Vercel)
              </p>
              <p className="mt-2 text-sm leading-relaxed text-teal-900/90">
                Sign in with a <strong>@psu.edu</strong> Firebase account that is
                allow-listed in Firestore: create collection{" "}
                <code className="rounded bg-white/80 px-1 text-xs">researchers</code>{" "}
                with document ID = your{" "}
                <a
                  className="font-medium underline"
                  href={consoleUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Auth UID
                </a>
                . Publish <code className="text-xs">firestore.rules</code> from this
                repo.
              </p>

              {!firebaseUser || !fbReady ? (
                <form
                  onSubmit={(e) => void handleFirebaseSignIn(e)}
                  className="mt-4 space-y-3"
                >
                  <div>
                    <label className="block text-xs font-semibold text-teal-950">
                      Firebase email
                    </label>
                    <input
                      type="email"
                      autoComplete="email"
                      value={fbEmail}
                      onChange={(e) => setFbEmail(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-teal-200 bg-white px-3 py-2 text-sm"
                      placeholder="you@psu.edu"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-teal-950">
                      Firebase password
                    </label>
                    <input
                      type="password"
                      autoComplete="current-password"
                      value={fbPassword}
                      onChange={(e) => setFbPassword(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-teal-200 bg-white px-3 py-2 text-sm"
                      required
                    />
                  </div>
                  {fbError && (
                    <p className="text-sm font-medium text-red-600">{fbError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full rounded-xl bg-teal-700 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
                  >
                    Sign in to Firebase
                  </button>
                </form>
              ) : (
                <div className="mt-4 space-y-3">
                  <p className="text-sm text-teal-900">
                    Firebase:{" "}
                    <span className="font-medium">
                      {firebaseUser.email ?? firebaseUser.uid}
                    </span>
                  </p>
                  {researcherOk === null && (
                    <p className="text-sm text-student-muted">Checking allow-list…</p>
                  )}
                  {researcherOk === false && (
                    <p className="text-sm font-medium text-amber-800" role="alert">
                      No <code className="text-xs">researchers/{firebaseUser.uid}</code>{" "}
                      document. Add it in the Console, then refresh this page.
                    </p>
                  )}
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      disabled={busy || !researcherOk}
                      onClick={() => void handleClientExportCsv()}
                      className="flex-1 rounded-xl bg-teal-700 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
                    >
                      {busy ? "Exporting…" : "Download CSV (browser)"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void signOut(getClientAuth())}
                      className="rounded-xl border border-teal-600 bg-white px-4 py-2.5 text-sm font-semibold text-teal-900"
                    >
                      Firebase sign out
                    </button>
                  </div>
                  {fbError && (
                    <p className="text-sm font-medium text-red-600">{fbError}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {error && (
            <p className="mt-4 text-sm font-medium text-red-600" role="alert">
              {error}
            </p>
          )}
          {exportHint && (
            <p className="mt-4 text-sm text-teal-800">{exportHint}</p>
          )}
        </div>

        <details className="mt-8 rounded-2xl border border-amber-200/90 bg-amber-50/80 px-5 py-4 text-sm text-amber-950">
          <summary className="cursor-pointer font-semibold">
            Optional: server export on Vercel
          </summary>
          <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed">
            <li>
              Set <strong>FIREBASE_SERVICE_ACCOUNT_JSON</strong> or the three{" "}
              <strong>FIREBASE_ADMIN_*</strong> variables so{" "}
              <code className="rounded bg-white/80 px-1">/api/admin/export-csv</code>{" "}
              can run without browser sign-in.
            </li>
            <li>
              Dashboard login defaults: <strong>admin</strong> /{" "}
              <strong>mattandseong</strong> (override with{" "}
              <strong>ADMIN_DASHBOARD_*</strong>).
            </li>
          </ul>
        </details>

        <p className="mt-12 text-center text-sm text-student-muted">
          <Link href="/" className="font-medium text-teal-700 hover:underline">
            Back to study home
          </Link>
        </p>
      </div>
    </div>
  );
}
