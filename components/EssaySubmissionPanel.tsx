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
      setError("Please write a fuller response (at least a short paragraph).");
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

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-slate-900">
        Your explanatory essay
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        Topic: <strong>{GENAI_TASK.title}</strong>
      </p>
      <p className="mt-2 text-sm text-slate-700">
        Paste or write your final essay here. It should reflect your
        understanding and may build on your chat above. Aim for about{" "}
        <strong>300 words</strong> and meet the task conditions from the
        instructions.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={18}
        className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        placeholder="Write your essay…"
      />
      <p className="mt-2 text-xs text-slate-500">
        Word count (approx.): {text.trim() ? text.trim().split(/\s+/).length : 0}
      </p>
      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={saving}
        className="mt-4 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {saving ? "Submitting…" : "Submit essay and finish"}
      </button>
    </form>
  );
}
