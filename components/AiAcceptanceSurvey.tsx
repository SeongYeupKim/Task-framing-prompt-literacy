"use client";

import { useState } from "react";
import { AI_ACCEPTANCE_ITEMS, LIKERT_SCALE } from "@/lib/aiAcceptanceSurvey";

type Props = {
  onSubmit: (responses: number[]) => Promise<void>;
};

export function AiAcceptanceSurvey({ onSubmit }: Props) {
  const [answers, setAnswers] = useState<(number | null)[]>(
    () => Array.from({ length: AI_ACCEPTANCE_ITEMS.length }, () => null)
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const complete = answers.every((a) => a !== null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!complete) return;
    setSaving(true);
    setError(null);
    try {
      await onSubmit(answers as number[]);
    } catch {
      setError("Could not save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="mx-auto max-w-3xl space-y-8 pb-12"
    >
      <div className="rounded-2xl border border-student-border bg-student-card px-5 py-6 shadow-student sm:px-8 sm:py-8">
        <h2 className="text-xl font-semibold text-student-ink">
          AI in learning — your views
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-student-muted">
          Before we begin, please rate how much you agree with each statement.
          Use the scale from <strong className="text-student-ink">1</strong>{" "}
          (strongly disagree) to <strong className="text-student-ink">5</strong>{" "}
          (strongly agree). There are no right or wrong answers.
        </p>
      </div>

      <div className="space-y-6">
        {AI_ACCEPTANCE_ITEMS.map((item, index) => (
          <div
            key={index}
            className="rounded-2xl border border-student-border bg-white px-4 py-5 shadow-sm sm:px-6"
          >
            <p className="text-sm font-medium text-student-ink">
              <span className="mr-2 text-student-muted">{index + 1}.</span>
              {item}
            </p>
            <fieldset className="mt-4">
              <legend className="sr-only">Agreement for statement {index + 1}</legend>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {LIKERT_SCALE.map(({ value, label }) => (
                  <label
                    key={value}
                    className={`flex min-h-[44px] min-w-[2.75rem] cursor-pointer flex-1 flex-col items-center justify-center rounded-xl border-2 px-2 py-2 text-center text-xs font-medium transition sm:min-w-0 sm:flex-1 sm:px-3 ${
                      answers[index] === value
                        ? "border-teal-600 bg-teal-600 text-white shadow-sm"
                        : "border-student-border bg-student-canvas text-student-ink hover:border-teal-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`item-${index}`}
                      className="sr-only"
                      checked={answers[index] === value}
                      onChange={() => {
                        setAnswers((prev) => {
                          const next = [...prev];
                          next[index] = value;
                          return next;
                        });
                      }}
                    />
                    <span className="text-base font-semibold tabular-nums">
                      {value}
                    </span>
                    <span className="mt-0.5 hidden leading-tight sm:block">
                      {label}
                    </span>
                  </label>
                ))}
              </div>
              <p className="mt-2 flex justify-between text-[10px] text-student-muted sm:hidden">
                <span>1 disagree</span>
                <span>5 agree</span>
              </p>
            </fieldset>
          </div>
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="flex min-h-[52px] flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
        <button
          type="submit"
          disabled={!complete || saving}
          className="rounded-2xl bg-teal-600 px-8 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving…" : "Continue to introduction"}
        </button>
      </div>
    </form>
  );
}
