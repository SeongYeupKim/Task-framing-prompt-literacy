"use client";

import { useState } from "react";
import { downloadSubmissionRecord } from "@/lib/submissionRecordPdf";
import type { ChatMessage } from "@/types/study";

type Props = {
  email: string;
  essay: string;
  messages: ChatMessage[];
  alreadyDownloaded: boolean;
  onDownloaded: () => Promise<void>;
  onFinish: () => Promise<void>;
};

export function SubmissionGuide({
  email,
  essay,
  messages,
  alreadyDownloaded,
  onDownloaded,
  onFinish,
}: Props) {
  const [downloaded, setDownloaded] = useState(alreadyDownloaded);
  const [busy, setBusy] = useState<"pdf" | "finish" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setBusy("pdf");
    setError(null);
    try {
      await downloadSubmissionRecord({ email, essay, messages });
      await onDownloaded();
      setDownloaded(true);
    } catch {
      setError("Could not create the PDF. Try again.");
    } finally {
      setBusy(null);
    }
  }

  async function handleFinish() {
    setBusy("finish");
    setError(null);
    try {
      await onFinish();
    } catch {
      setError("Could not save. Try again.");
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-12">
      <div className="rounded-2xl border border-student-border bg-student-card px-6 py-7 shadow-student">
        <h2 className="text-xl font-semibold text-student-ink">
          Download your assignment record
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-student-muted">
          This PDF is your proof of submission. It contains only the essay you
          submitted and the chat history from this session. Upload that file to
          the Canvas assignment.
        </p>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-student-ink">
          <li>Download the assignment record.</li>
          <li>Open Canvas and the assignment for this task.</li>
          <li>Upload the PDF you just downloaded.</li>
          <li>Return here and choose Finish.</li>
        </ol>
      </div>

      <button
        type="button"
        onClick={() => void handleDownload()}
        disabled={busy !== null}
        className="w-full rounded-2xl bg-teal-600 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-teal-700 disabled:opacity-50"
      >
        {busy === "pdf"
          ? "Preparing PDF…"
          : downloaded
            ? "Download the record again"
            : "Download assignment record"}
      </button>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={() => void handleFinish()}
        disabled={!downloaded || busy !== null}
        className="w-full rounded-2xl border border-student-border bg-white py-3.5 text-base font-semibold text-student-ink hover:bg-student-canvas disabled:opacity-50"
      >
        {busy === "finish" ? "Saving…" : "I uploaded it to Canvas — finish"}
      </button>
      {!downloaded && (
        <p className="text-center text-xs text-student-muted">
          Download the record before you finish.
        </p>
      )}
    </div>
  );
}
