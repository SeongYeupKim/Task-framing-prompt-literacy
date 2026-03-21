"use client";

import { useState } from "react";
import { GENAI_TASK } from "@/lib/studyContent";

type Props = {
  initialText: string;
  onSubmit: (text: string) => Promise<void>;
};

export function EssaySubmissionPanel({ initialText, onSubmit }: Props) {
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
      className="mx-auto max-w-3xl rounded-2xl border border-student-border bg-student-card p-6 shadow-student sm:p-8"
    >
      <h2 className="text-xl font-semibold text-student-ink">Your essay</h2>
      <p className="mt-2 text-sm text-student-muted">
        Topic:{" "}
        <span className="font-medium text-student-ink">{GENAI_TASK.title}</span>
      </p>
      <p className="mt-4 text-sm leading-relaxed text-student-ink">
        Write your own explanation here. You can use ideas from the chat, but
        the essay should be your words. Aim for about{" "}
        <span className="font-medium">300 words</span> and cover the points on
        the previous screen as best you can.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={18}
        className="mt-4 w-full rounded-2xl border border-student-border bg-white px-4 py-3 text-base leading-relaxed text-student-ink focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
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
      <button
        type="submit"
        disabled={saving}
        className="mt-6 rounded-2xl bg-teal-600 px-8 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-teal-700 disabled:opacity-50"
      >
        {saving ? "Submitting…" : "Submit and finish"}
      </button>
    </form>
  );
}
