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
      className="mx-auto w-full max-w-[1400px] space-y-3 pb-6"
    >
      <div className="rounded-md border border-student-border bg-student-card px-4 py-3 shadow-student sm:px-5">
        <h2 className="text-xl font-semibold text-student-ink">
          AI in learning — your views
        </h2>
        <p className="mt-1 text-base leading-6 text-student-ink">
          Rate each statement using the matrix below:{" "}
          <strong className="font-semibold">1</strong> = strongly disagree
          through <strong className="font-semibold">5</strong> = strongly
          agree. Select one number per row. There are no wrong answers.
        </p>
      </div>

      <div className="overflow-x-auto rounded-md border border-student-border bg-white shadow-sm">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="bg-student-canvas/80">
              <th
                scope="col"
                rowSpan={2}
                className="sticky left-0 z-10 min-w-[280px] max-w-[min(58vw,520px)] border-b border-student-border bg-student-canvas/95 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-student-muted backdrop-blur-sm"
              >
                Statement
              </th>
              {LIKERT_SCALE.map(({ value }) => (
                <th
                  key={value}
                  scope="col"
                  className="h-8 w-16 min-w-[3.25rem] px-1 text-center align-middle text-base font-semibold tabular-nums leading-none text-navy-800"
                >
                  {value}
                </th>
              ))}
            </tr>
            <tr className="border-b border-student-border bg-student-canvas/80">
              {LIKERT_SCALE.map(({ value, label }) => (
                <th
                  key={value}
                  scope="col"
                  className="w-16 min-w-[3.25rem] px-1 pb-2 text-center align-top text-[10px] font-normal leading-tight text-student-muted"
                >
                  {label}
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
                  className="sticky left-0 z-[1] min-w-[280px] max-w-[min(58vw,520px)] bg-inherit px-4 py-2.5 pr-3 text-left align-middle text-base font-normal leading-6 text-student-ink"
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
                        className="h-4 w-4 accent-navy-800"
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
          className="rounded-md bg-navy-800 px-8 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-navy-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving…" : "Continue to introduction"}
        </button>
      </div>
    </form>
  );
}
