"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

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

export default function AdminDashboardPage() {
  const [authed, setAuthed] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [exportHint, setExportHint] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const s = readSession();
    if (s) {
      setUsername(s.username);
      setPassword(s.password);
      setAuthed(true);
    }
    setHydrated(true);
  }, []);

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
  }, []);

  const handleDownloadCsv = useCallback(async () => {
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
        const j = (await res.json().catch(() => ({}))) as { error?: string };
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
      setExportHint("Download started. One wide CSV: all arms share columns; unused fields are blank.");
    } catch {
      setError("Could not download export.");
    } finally {
      setBusy(false);
    }
  }, [username, password]);

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
            <span className="text-student-muted">Signed in as </span>
            <span className="font-medium">{username}</span>
          </p>
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleDownloadCsv()}
            className="mt-6 w-full rounded-2xl bg-teal-600 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 disabled:opacity-50"
          >
            {busy ? "Preparing CSV…" : "Download all participants (CSV)"}
          </button>
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
            Server setup (Vercel / local)
          </summary>
          <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed">
            <li>
              Login defaults: <strong>admin</strong> / <strong>mattandseong</strong>{" "}
              unless you set <strong>ADMIN_DASHBOARD_USERNAME</strong>,{" "}
              <strong>ADMIN_DASHBOARD_PASSWORD</strong>, or legacy{" "}
              <strong>ADMIN_EXPORT_SECRET</strong> on the server.
            </li>
            <li>
              <strong>FIREBASE_SERVICE_ACCOUNT_JSON</strong> (one-line JSON) or{" "}
              <strong>FIREBASE_ADMIN_PROJECT_ID</strong>,{" "}
              <strong>FIREBASE_ADMIN_CLIENT_EMAIL</strong>,{" "}
              <strong>FIREBASE_ADMIN_PRIVATE_KEY</strong> so the server can read{" "}
              <code className="rounded bg-white/80 px-1">users</code>.
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
