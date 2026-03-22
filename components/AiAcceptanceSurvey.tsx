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
      className="mx-auto max-w-5xl space-y-6 pb-12"
    >
      <div className="rounded-2xl border border-student-border bg-student-card px-5 py-6 shadow-student sm:px-8 sm:py-8">
        <h2 className="text-xl font-semibold text-student-ink">
          AI in learning — your views
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-student-muted">
          Rate each statement using the matrix below:{" "}
          <strong className="text-student-ink">1</strong> = strongly disagree
          through <strong className="text-student-ink">5</strong> = strongly
          agree. Select one number per row. There are no wrong answers.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-student-border bg-white shadow-sm">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-student-border bg-student-canvas/80">
              <th
                scope="col"
                className="sticky left-0 z-10 min-w-[220px] max-w-[min(50vw,340px)] bg-student-canvas/95 px-3 py-3 text-xs font-semibold uppercase tracking-wide text-student-muted backdrop-blur-sm sm:min-w-[260px]"
              >
                Statement
              </th>
              {LIKERT_SCALE.map(({ value, label }) => (
                <th
                  key={value}
                  scope="col"
                  className="w-14 min-w-[3.25rem] px-1 py-2 text-center align-bottom text-xs font-semibold text-student-ink sm:w-16"
                >
                  <span className="block tabular-nums text-base text-teal-700">
                    {value}
                  </span>
                  <span className="mt-1 hidden leading-tight text-[10px] font-normal text-student-muted sm:block">
                    {label}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {AI_ACCEPTANCE_ITEMS.map((item, index) => (
              <tr
                key={index}
                className="border-b border-student-border/80 odd:bg-white even:bg-student-canvas/30"
              >
                <th
                  scope="row"
                  className="sticky left-0 z-[1] max-w-[min(50vw,340px)] bg-inherit px-3 py-2.5 pr-2 text-left align-top text-[0.8125rem] font-normal leading-snug text-student-ink"
                >
                  <span className="mr-1.5 font-semibold text-student-muted tabular-nums">
                    {index + 1}.
                  </span>
                  {item}
                </th>
                {LIKERT_SCALE.map(({ value }) => (
                  <td key={value} className="px-1 py-2 text-center align-middle">
                    <label className="flex cursor-pointer items-center justify-center">
                      <input
                        type="radio"
                        name={`ai-acc-${index}`}
                        value={value}
                        checked={answers[index] === value}
                        onChange={() => {
                          setAnswers((prev) => {
                            const next = [...prev];
                            next[index] = value;
                            return next;
                          });
                        }}
                        className="h-4 w-4 accent-teal-600"
                      />
                      <span className="sr-only">
                        Statement {index + 1}, {value}
                      </span>
                    </label>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-center text-xs text-student-muted sm:hidden">
        Scroll horizontally to see all columns · 1 = disagree · 5 = agree
      </p>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="flex justify-center">
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
