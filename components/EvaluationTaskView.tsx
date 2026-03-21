"use client";

import { useState } from "react";
import type { EvalCaseId, EvaluationTaskSubmission } from "@/types/study";

type CaseDef = {
  label: string;
  prompts: string[];
};

type Props = {
  taskKey: "eval1" | "eval2";
  title: string;
  scenario: string;
  taskConditions: string[];
  cases: {
    studentA: CaseDef;
    studentB: CaseDef;
    studentC: CaseDef;
  };
  onSubmit: (submission: EvaluationTaskSubmission) => Promise<void>;
};

const CASES: EvalCaseId[] = ["studentA", "studentB", "studentC"];

/** Mock “texts to the AI” — each line as a sent bubble. */
function PromptMessageThread({ prompts, label }: { prompts: string[]; label: string }) {
  return (
    <div className="mx-auto max-w-sm">
      <p className="mb-2 text-center text-xs font-medium uppercase tracking-wide text-student-muted">
        {label} — messages to the AI
      </p>
      <div className="rounded-3xl bg-slate-300/40 p-3 shadow-inner">
        <div className="max-h-[min(420px,55vh)] space-y-2 overflow-y-auto pr-1">
          {prompts.map((text, i) => (
            <div key={i} className="flex justify-end">
              <div className="max-w-[95%] rounded-2xl rounded-br-md bg-teal-600 px-3.5 py-2 text-[0.8125rem] leading-snug text-white shadow-sm">
                {text}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

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
    <div className="rounded-2xl border border-student-border bg-student-card p-5 shadow-student sm:p-6">
      <PromptMessageThread prompts={prompts} label={label} />

      <div className="mt-6 rounded-xl bg-student-canvas px-3 py-4">
        <p className="text-sm font-medium text-student-ink">
          Overall, how strong are these prompts for this task?
        </p>
        <p className="mt-1 text-xs text-student-muted">
          1 = very weak · 6 = very strong
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onRating(n)}
              className={`min-h-[44px] min-w-[44px] rounded-xl border-2 text-sm font-semibold transition ${
                rating === n
                  ? "border-teal-600 bg-teal-600 text-white shadow-sm"
                  : "border-student-border bg-white text-student-ink hover:border-teal-400"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4">
        <label className="text-sm font-medium text-student-ink">
          Why did you choose that rating?
        </label>
        <p className="mt-0.5 text-xs text-student-muted">
          A few sentences is fine; more detail is welcome.
        </p>
        <textarea
          value={rationale}
          onChange={(e) => onRationale(e.target.value)}
          rows={5}
          className="mt-2 w-full rounded-xl border border-student-border bg-white px-3 py-2.5 text-sm text-student-ink shadow-sm placeholder:text-student-muted/70 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          placeholder="What worked or didn’t in how they framed the task?"
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
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-8">
      <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-orange-50/50 px-5 py-6 shadow-student sm:px-7">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-900/70">
          Scenario
        </p>
        <h2 className="mt-1 text-xl font-semibold text-student-ink">{title}</h2>
        <p className="mt-3 text-base leading-relaxed text-student-ink">{scenario}</p>
        <h3 className="mt-5 text-xs font-semibold uppercase tracking-wide text-student-muted">
          Task conditions (the explanation should satisfy all of these)
        </h3>
        <ul className="mt-2 space-y-2 text-sm leading-relaxed text-student-ink">
          {taskConditions.map((c) => (
            <li key={c} className="flex gap-2 border-l-2 border-teal-400 pl-3">
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-student-border bg-student-card px-5 py-5 shadow-student sm:px-7">
        <h2 className="text-lg font-semibold text-student-ink">
          Rate three students’ prompts
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-student-muted">
          Below are mock messages each student sent to the AI (like texts). For
          each person, pick a number from 1 to 6 and explain your choice.
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
        className="w-full rounded-2xl bg-teal-600 px-6 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {saving ? "Saving…" : "Submit and continue"}
      </button>
    </form>
  );
}
