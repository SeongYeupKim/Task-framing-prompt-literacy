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
  const [data, setData] = useState<AdminExportPayload | null>(null);

  const runExport = useCallback(async () => {
    setError(null);
    setData(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: secret.trim() }),
      });
      const json = (await res.json()) as AdminExportPayload & { error?: string };
      if (!res.ok) {
        setError(json.error || `Request failed (${res.status})`);
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
            <p className="mt-4 text-sm font-medium text-red-600" role="alert">
              {error}
            </p>
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
