"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import type { AdminExportPayload } from "@/lib/adminExportFormat";
import {
  downloadBlob,
  participantsToChatTranscript,
  participantsToCsv,
} from "@/lib/adminExportFormat";

export default function AdminDashboardPage() {
  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [data, setData] = useState<AdminExportPayload | null>(null);

  const runExport = useCallback(async () => {
    setError(null);
    setErrorDetail(null);
    setData(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: secret.trim() }),
      });
      const json = (await res.json()) as AdminExportPayload & {
        error?: string;
        hint?: string;
        vercelEnv?: string | null;
        credentialEnv?: {
          hasFullJson: boolean;
          hasProjectId: boolean;
          hasClientEmail: boolean;
          hasPrivateKey: boolean;
        };
      };
      if (!res.ok) {
        setError(json.error || `Request failed (${res.status})`);
        const cred = json.credentialEnv;
        const credLine = cred
          ? `Server checks (no secrets shown): FIREBASE_SERVICE_ACCOUNT_JSON seen=${cred.hasFullJson}; split vars seen: projectId=${cred.hasProjectId}, clientEmail=${cred.hasClientEmail}, privateKey=${cred.hasPrivateKey}. If all are false, add the variables to this Vercel project for Production and redeploy.`
          : null;
        const parts = [
          json.hint,
          json.vercelEnv != null
            ? `Vercel deployment environment: ${json.vercelEnv}`
            : null,
          credLine,
        ].filter(Boolean);
        setErrorDetail(parts.length ? parts.join("\n\n") : null);
        return;
      }
      if (typeof json.participantCount !== "number" || !Array.isArray(json.participants)) {
        setError("Unexpected response from server.");
        return;
      }
      setData(json as AdminExportPayload);
    } catch {
      setError("Network error — try again.");
    } finally {
      setLoading(false);
    }
  }, [secret]);

  const stamp = data?.exportedAt
    ? data.exportedAt.replace(/[:.]/g, "-").slice(0, 19)
    : "export";

  return (
    <div className="min-h-screen bg-student-canvas px-4 py-10 text-student-ink">
      <div className="mx-auto max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-student-muted">
          Researcher
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Data export dashboard
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-student-muted">
          Download participant records from Firestore, including full GenAI chat
          logs (<span className="text-student-ink">genaiMessages</span>: every
          student message and assistant reply with timestamps). Use only on
          secure devices; exports contain identifiable study data.
        </p>

        <details className="mt-6 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-950">
          <summary className="cursor-pointer font-semibold">
            First-time setup: Firebase credentials on Vercel
          </summary>
          <ol className="mt-3 list-decimal space-y-2 pl-5 leading-relaxed">
            <li>
              Open{" "}
              <a
                className="font-medium text-teal-800 underline"
                href="https://console.firebase.google.com"
                target="_blank"
                rel="noreferrer"
              >
                Firebase Console
              </a>{" "}
              → your study project → ⚙️ <strong>Project settings</strong> →{" "}
              <strong>Service accounts</strong>.
            </li>
            <li>
              Click <strong>Generate new private key</strong> → download the{" "}
              <code className="rounded bg-white/90 px-1">.json</code> file.
            </li>
            <li>
              In{" "}
              <strong>
                Vercel → this project → Settings → Environment Variables
              </strong>
              , under <strong>Production</strong>, add <em>either</em>:
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>
                  <code className="rounded bg-white/90 px-1">
                    FIREBASE_SERVICE_ACCOUNT_JSON
                  </code>{" "}
                  = entire file as <strong>one line</strong> (terminal:{" "}
                  <code className="rounded bg-white/90 px-1">
                    jq -c . your-key.json
                  </code>
                  ), <em>or</em>
                </li>
                <li>
                  Three variables:{" "}
                  <code className="rounded bg-white/90 px-1">
                    FIREBASE_ADMIN_PROJECT_ID
                  </code>
                  ,{" "}
                  <code className="rounded bg-white/90 px-1">
                    FIREBASE_ADMIN_CLIENT_EMAIL
                  </code>
                  ,{" "}
                  <code className="rounded bg-white/90 px-1">
                    FIREBASE_ADMIN_PRIVATE_KEY
                  </code>{" "}
                  (copy from the same JSON; for the private key use{" "}
                  <code className="rounded bg-white/90 px-1">\n</code> where
                  line breaks were).
                </li>
              </ul>
            </li>
            <li>
              Save variables, then <strong>Redeploy</strong> (Deployments → ⋯
              → Redeploy). Preview-only variables will{" "}
              <strong>not</strong> work on{" "}
              <code className="rounded bg-white/90 px-1">
                taskframing.vercel.app
              </code>{" "}
              unless you also enable them for Production.
            </li>
          </ol>
        </details>

        <div className="mt-8 rounded-2xl border border-student-border bg-student-card p-6 shadow-student">
          <label className="block text-sm font-semibold text-student-ink">
            Admin export password
          </label>
          <input
            type="password"
            autoComplete="off"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className="mt-2 w-full rounded-xl border border-student-border px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            placeholder="Set in ADMIN_EXPORT_SECRET on the server"
          />
          <button
            type="button"
            disabled={loading || !secret.trim()}
            onClick={() => void runExport()}
            className="mt-4 w-full rounded-2xl bg-teal-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Fetching…" : "Load export from database"}
          </button>
          {error && (
            <div className="mt-4 space-y-2" role="alert">
              <p className="text-sm font-medium text-red-600">{error}</p>
              {errorDetail && (
                <p className="whitespace-pre-wrap text-xs leading-relaxed text-red-800/90">
                  {errorDetail}
                </p>
              )}
            </div>
          )}
        </div>

        {data && (
          <div className="mt-8 space-y-4 rounded-2xl border border-teal-200 bg-teal-50/50 p-6 shadow-sm">
            <p className="text-sm font-medium text-teal-900">
              Loaded{" "}
              <span className="font-semibold">{data.participantCount}</span>{" "}
              participant
              {data.participantCount === 1 ? "" : "s"}
              {data.projectId ? (
                <>
                  {" "}
                  (project <span className="font-mono text-xs">{data.projectId}</span>)
                </>
              ) : null}
              . Exported at {new Date(data.exportedAt).toLocaleString()}.
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
                Download CSV (tabular + JSON columns)
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
            <p className="text-xs leading-relaxed text-teal-900/80">
              JSON includes the complete Firestore document per participant
              (demographics, eval ratings, essay text, instruction matching,
              etc.). CSV repeats most fields and stores{" "}
              <code className="rounded bg-white/80 px-1">genaiMessages</code> as
              a JSON column. The .txt file is human-readable chat only.
            </p>
          </div>
        )}

        <p className="mt-10 text-center text-sm text-student-muted">
          <Link href="/" className="font-medium text-teal-700 hover:underline">
            Back to study home
          </Link>
        </p>
      </div>
    </div>
  );
}
