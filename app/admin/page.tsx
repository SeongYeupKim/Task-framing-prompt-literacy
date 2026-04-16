"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FirebaseError } from "firebase/app";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { downloadBlob } from "@/lib/adminExportFormat";
import { buildStudyWideExportCsv } from "@/lib/studyWideExportCsv";
import { getClientAuth, getClientDb } from "@/lib/firebase";
import { formatAuthError } from "@/lib/firebaseErrors";
import { RESEARCH_EXPORT_FIREBASE_EMAIL } from "@/lib/researchExportEmail";
import { serializeFirestoreValue } from "@/lib/firestoreSerializeClient";

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
    return "Permission denied. In Firebase → Firestore → Rules, publish firestore.rules from this repo.";
  }
  if (err instanceof Error) return err.message;
  return "Export failed.";
}

function isExportFirebaseUser(u: User | null): boolean {
  const e = u?.email?.trim().toLowerCase();
  return !!e && e === RESEARCH_EXPORT_FIREBASE_EMAIL;
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

  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [fbReady, setFbReady] = useState(false);
  const [fbError, setFbError] = useState<string | null>(null);
  const [firebaseConnecting, setFirebaseConnecting] = useState(false);
  const triedExportSignIn = useRef(false);

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() ?? "";
  const authUsersUrl = projectId
    ? `https://console.firebase.google.com/project/${projectId}/authentication/users`
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

  /** Same password as dashboard → Firebase export account (Nudge-style one form). */
  useEffect(() => {
    if (!authed || !fbReady) return;
    if (serverExportEnabled !== false) return;
    if (firebaseUser && isExportFirebaseUser(firebaseUser)) return;
    if (triedExportSignIn.current) return;

    const s = readSession();
    if (!s?.password) return;

    triedExportSignIn.current = true;
    let cancelled = false;
    setFirebaseConnecting(true);
    setFbError(null);
    void (async () => {
      try {
        await signInWithEmailAndPassword(
          getClientAuth(),
          RESEARCH_EXPORT_FIREBASE_EMAIL,
          s.password,
        );
      } catch (e) {
        if (!cancelled) {
          setFbError(formatAuthError(e));
        }
      } finally {
        if (!cancelled) setFirebaseConnecting(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authed, serverExportEnabled, fbReady, firebaseUser]);

  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setFbError(null);
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
        triedExportSignIn.current = false;
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
    triedExportSignIn.current = false;
    void signOut(getClientAuth());
    setAuthed(false);
    setPassword("");
    setExportHint(null);
    setServerExportEnabled(null);
    setError(null);
    setFbError(null);
    setFirebaseConnecting(false);
  }, []);

  const runServerExport = useCallback(async () => {
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
      setExportHint("Download started.");
    } catch {
      setError("Could not download export.");
    } finally {
      setBusy(false);
    }
  }, [username, password]);

  const runClientExport = useCallback(async () => {
    if (!isExportFirebaseUser(firebaseUser)) return;
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
      downloadBlob(
        `task-framing-study-wide-${stamp}.csv`,
        csv,
        "text/csv;charset=utf-8",
      );
      setExportHint("Download complete.");
    } catch (err) {
      setFbError(formatClientExportError(err));
    } finally {
      setBusy(false);
    }
  }, [firebaseUser]);

  const handleDownloadCsv = useCallback(async () => {
    if (serverExportEnabled === true) {
      await runServerExport();
      return;
    }
    if (isExportFirebaseUser(firebaseUser)) {
      await runClientExport();
      return;
    }
    setError("Cannot download yet — wait for Firebase sign-in or fix the setup note below.");
  }, [serverExportEnabled, firebaseUser, runServerExport, runClientExport]);

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
            Sign in, then download the CSV (same flow as a simple admin panel).
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
            <p className="text-xs leading-relaxed text-student-muted">
              Use the same password for Firebase user{" "}
              <strong>{RESEARCH_EXPORT_FIREBASE_EMAIL}</strong> (see one-time setup
              after login).
            </p>
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

  const serverReady = serverExportEnabled === true;
  const browserReady =
    serverExportEnabled === false && isExportFirebaseUser(firebaseUser);
  const downloadDisabled =
    busy ||
    serverExportEnabled === null ||
    (!serverReady && (firebaseConnecting || !browserReady));

  let downloadLabel = "Download all participants (CSV)";
  if (busy) downloadLabel = "Preparing…";
  else if (serverExportEnabled === null) downloadLabel = "Checking…";
  else if (firebaseConnecting) downloadLabel = "Connecting…";
  else if (serverExportEnabled === false && !browserReady) {
    downloadLabel = "Waiting for Firebase…";
  }

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
              One login here, then download. No second form — we sign into Firebase
              as <strong>{RESEARCH_EXPORT_FIREBASE_EMAIL}</strong> using the same
              password you just entered.
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
            <span className="text-student-muted">Signed in: </span>
            <span className="font-medium">{username}</span>
          </p>

          <button
            type="button"
            disabled={downloadDisabled}
            onClick={() => void handleDownloadCsv()}
            className="mt-6 w-full rounded-2xl bg-teal-600 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 disabled:opacity-50"
          >
            {downloadLabel}
          </button>

          {serverExportEnabled === true && (
            <p className="mt-3 text-xs text-student-muted">
              Server export (Firebase Admin on Vercel).
            </p>
          )}

          {fbError && (
            <p className="mt-4 text-sm font-medium text-red-600" role="alert">
              {fbError}
            </p>
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

        <div className="mt-8 rounded-2xl border border-amber-200/90 bg-amber-50/90 px-5 py-4 text-sm text-amber-950">
          <p className="font-semibold">One-time Firebase setup (only if download stays stuck)</p>
          <ol className="mt-3 list-decimal space-y-2 pl-5 leading-relaxed">
            <li>
              Open{" "}
              <a
                href={authUsersUrl}
                className="font-medium underline"
                target="_blank"
                rel="noreferrer"
              >
                Authentication → Users
              </a>
              .
            </li>
            <li>
              <strong>Add user</strong> → email{" "}
              <code className="rounded bg-white/90 px-1">{RESEARCH_EXPORT_FIREBASE_EMAIL}</code>{" "}
              → password = <strong>the same password</strong> you use on this page
              (e.g. <code className="text-xs">mattandseong</code>).
            </li>
            <li>
              <strong>Firestore → Rules</strong> → paste the full{" "}
              <code className="text-xs">firestore.rules</code> file from this
              project → <strong>Publish</strong>.
            </li>
          </ol>
          <p className="mt-3 text-xs text-amber-900/90">
            Optional: add <strong>FIREBASE_SERVICE_ACCOUNT_JSON</strong> on Vercel
            to skip browser Firebase entirely.
          </p>
        </div>

        <p className="mt-12 text-center text-sm text-student-muted">
          <Link href="/" className="font-medium text-teal-700 hover:underline">
            Back to study home
          </Link>
        </p>
      </div>
    </div>
  );
}
