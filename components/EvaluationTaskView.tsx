"use client";

import { useState } from "react";
import type { EvalCaseId, EvaluationTaskSubmission } from "@/types/study";

type Props = {
  taskKey: "eval1" | "eval2";
  title: string;
  scenario: string;
  taskConditions: string[];
  cases: {
    studentA: { label: string; prompts: string[] };
    studentB: { label: string; prompts: string[] };
    studentC: { label: string; prompts: string[] };
  };
  onSubmit: (submission: EvaluationTaskSubmission) => Promise<void>;
};

const CASES: EvalCaseId[] = ["studentA", "studentB", "studentC"];

function CaseCard({
  label,
  prompts,
  rating,
  rationale,
  onRating,
  onRationale,
}: {
  label: string;
  prompts: string[];
  rating: number | null;
  rationale: string;
  onRating: (v: number) => void;
  onRationale: (v: string) => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-5">
      <h3 className="font-semibold text-slate-900">{label}</h3>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-700">
        {prompts.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ol>
      <div className="mt-5">
        <p className="text-sm font-medium text-slate-800">
          Overall quality of this student&apos;s prompts (1 = very low, 6 =
          very high)
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onRating(n)}
              className={`min-w-[2.5rem] rounded-lg border px-3 py-2 text-sm font-medium transition ${
                rating === n
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-slate-300 bg-white text-slate-800 hover:border-brand-400"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4">
        <label className="text-sm font-medium text-slate-800">
          Rationale (explain your judgment in depth)
        </label>
        <textarea
          value={rationale}
          onChange={(e) => onRationale(e.target.value)}
          rows={5}
          className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          placeholder="Refer to how well the prompts define the task (goal, scope, constraints, audience, format, criteria)…"
        />
      </div>
    </div>
  );
}

export function EvaluationTaskView({
  taskKey,
  title,
  scenario,
  taskConditions,
  cases,
  onSubmit,
}: Props) {
  const [ratings, setRatings] = useState({
    studentA: null as number | null,
    studentB: null as number | null,
    studentC: null as number | null,
  });
  const [rationales, setRationales] = useState({
    studentA: "",
    studentB: "",
    studentC: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const complete =
    ratings.studentA !== null &&
    ratings.studentB !== null &&
    ratings.studentC !== null &&
    rationales.studentA.trim().length > 0 &&
    rationales.studentB.trim().length > 0 &&
    rationales.studentC.trim().length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!complete) return;
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        taskKey,
        ratings: {
          studentA: ratings.studentA!,
          studentB: ratings.studentB!,
          studentC: ratings.studentC!,
        },
        rationales: {
          studentA: rationales.studentA.trim(),
          studentB: rationales.studentB.trim(),
          studentC: rationales.studentC.trim(),
        },
        submittedAt: new Date().toISOString(),
      });
    } catch {
      setError("Could not save. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-5">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">
          {scenario}
        </p>
        <h3 className="mt-4 text-sm font-semibold text-slate-900">
          Task conditions (the explanation should satisfy all of these)
        </h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
          {taskConditions.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-base font-semibold text-slate-900">
          Evaluate each student&apos;s prompts
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Rate prompt quality from <strong>1 (very low)</strong> to{" "}
          <strong>6 (very high)</strong> and provide a detailed rationale for
          each.
        </p>
      </div>

      {CASES.map((id) => (
        <CaseCard
          key={id}
          label={cases[id].label}
          prompts={cases[id].prompts}
          rating={ratings[id]}
          rationale={rationales[id]}
          onRating={(v) => setRatings((r) => ({ ...r, [id]: v }))}
          onRationale={(v) => setRationales((r) => ({ ...r, [id]: v }))}
        />
      ))}

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!complete || saving}
        className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "Saving…" : "Submit evaluation"}
      </button>
    </form>
  );
}
