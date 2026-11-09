"use client";

import { useState } from "react";
import { GENAI_TASK } from "@/lib/studyContent";

type Props = {
  initialText: string;
  onSubmit: (text: string) => Promise<void>;
  /** Narrow column layout next to chat */
  embedded?: boolean;
};

export function EssaySubmissionPanel({
  initialText,
  onSubmit,
  embedded = false,
}: Props) {
  const [text, setText] = useState(initialText);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (text.trim().length < 50) {
      setError("Please write a bit more—at least a short paragraph.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSubmit(text.trim());
    } catch {
      setError("Could not save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className={`rounded-md border border-student-border bg-student-card shadow-student ${
        embedded
          ? "flex h-full min-h-0 max-h-full flex-col overflow-hidden p-3"
          : "mx-auto max-w-3xl p-6 sm:p-8"
      }`}
    >
      <div className={embedded ? "shrink-0" : ""}>
        <p className="text-xs font-semibold uppercase tracking-wide text-student-muted">
          Your essay
        </p>
        {embedded ? (
          <p className="mt-1 text-sm leading-5 text-student-ink">
            <span className="font-semibold">Write in your own words.</span> Aim
            for 250–300 words and meet the task requirements above. Your essay
            and chat are saved together; you will download a PDF for Canvas.
          </p>
        ) : (
          <>
            <h2 className="mt-1 text-lg font-semibold text-student-ink">
              {GENAI_TASK.title}
            </h2>
            <div className="mt-4 space-y-4 text-base leading-7 text-student-ink">
              <p>
                <span className="font-bold underline decoration-navy-800 decoration-2 underline-offset-2">
                  Write in your own words.
                </span>{" "}
                You may use ideas from the chat on the left.
              </p>
              <p>
                Aim for about{" "}
                <span className="font-bold underline decoration-navy-800 decoration-2 underline-offset-2">
                  250–300 words
                </span>{" "}
                and address the task requirements.
              </p>
            </div>
          </>
        )}
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={embedded ? 8 : 18}
        className={`mt-2 w-full rounded-md border border-student-border bg-white px-3 py-2 text-sm leading-relaxed text-student-ink focus:border-navy-800 focus:outline-none focus:ring-2 focus:ring-navy-700/20 ${
          embedded ? "min-h-0 flex-1 resize-none" : ""
        }`}
        placeholder="Start typing your essay…"
      />
      <p className="mt-1 shrink-0 text-xs text-student-muted">
        Approx. word count: <span className="font-medium">{words}</span>
      </p>
      {error && (
        <p className="mt-1 shrink-0 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={saving}
        className={`mt-2 w-full shrink-0 rounded-md bg-navy-800 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-navy-900 disabled:opacity-50`}
      >
        {saving ? "Submitting…" : "Submit and finish"}
      </button>
    </form>
  );
}
