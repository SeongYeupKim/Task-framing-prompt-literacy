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
      className={`rounded-2xl border border-student-border bg-student-card shadow-student ${
        embedded ? "flex max-h-[min(85vh,900px)] flex-col p-5" : "mx-auto max-w-3xl p-6 sm:p-8"
      }`}
    >
      <div className={embedded ? "min-h-0 flex-1 overflow-y-auto" : ""}>
        <p className="text-xs font-semibold uppercase tracking-wide text-student-muted">
          Your essay
        </p>
        <h2 className="mt-1 text-lg font-semibold text-student-ink">
          {GENAI_TASK.title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-student-ink">
          Write your own explanation. You can use ideas from the chat in the
          middle—scroll there if you need to. Aim for about{" "}
          <span className="font-medium">300 words</span> and cover the task
          points from the first column as best you can.
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={embedded ? 14 : 18}
          className="mt-4 w-full rounded-xl border border-student-border bg-white px-3 py-3 text-sm leading-relaxed text-student-ink focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          placeholder="Start typing your essay…"
        />
        <p className="mt-2 text-xs text-student-muted">
          Approx. word count: <span className="font-medium">{words}</span>
        </p>
        {error && (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={saving}
        className={`mt-4 w-full rounded-2xl bg-teal-600 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-teal-700 disabled:opacity-50 ${
          embedded ? "shrink-0" : ""
        }`}
      >
        {saving ? "Submitting…" : "Submit and finish"}
      </button>
    </form>
  );
}
