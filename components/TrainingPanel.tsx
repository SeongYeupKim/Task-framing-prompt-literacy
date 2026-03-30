"use client";

import { useMemo, useState } from "react";
import {
  TRAINING_SECTIONS,
  INSTRUCTION_DIMENSIONS,
  INSTRUCTION_MATCHING_POOL,
  type TextChunk,
} from "@/lib/studyContent";
import type { InstructionPracticeData } from "@/types/study";
import { DimensionConnectPractice } from "@/components/DimensionConnectPractice";

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function renderChunks(chunks: TextChunk[]) {
  return chunks.map((c, i) => {
    if (typeof c === "string") {
      return <span key={i}>{c}</span>;
    }
    return (
      <strong key={i} className="font-semibold text-student-ink">
        {c.b}
      </strong>
    );
  });
}

function ParagraphBlock({ p }: { p: string | TextChunk[] }) {
  if (typeof p === "string") {
    return <p>{p}</p>;
  }
  return <p className="leading-relaxed">{renderChunks(p)}</p>;
}

type Props = {
  onComplete: (data: InstructionPracticeData) => Promise<void>;
};

const part2 = TRAINING_SECTIONS[1];

export function TrainingPanel({ onComplete }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selfExplanation, setSelfExplanation] = useState("");
  const [matching, setMatching] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shuffledExamples = useMemo(() => shuffle(INSTRUCTION_MATCHING_POOL), []);

  const part1Complete = selfExplanation.trim().length >= 40;
  const allMatched =
    INSTRUCTION_DIMENSIONS.every((d) => matching[d.key]?.length > 0) &&
    (() => {
      const ids = INSTRUCTION_DIMENSIONS.map((d) => matching[d.key]);
      return new Set(ids).size === ids.length;
    })();

  async function handleFinish() {
    setError(null);
    if (!allMatched) {
      setError("Choose one example for each dimension, using each example exactly once.");
      return;
    }
    const ids = INSTRUCTION_DIMENSIONS.map((d) => matching[d.key]);
    if (new Set(ids).size !== ids.length) {
      setError("Each example can only be selected once.");
      return;
    }
    setSaving(true);
    try {
      await onComplete({
        selfExplanation: selfExplanation.trim(),
        matchingByDimension: { ...matching },
        matchingExampleDisplayOrder: shuffledExamples.map((e) => e.id),
      });
    } catch {
      setError("Could not save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className={`mx-auto w-full space-y-8 pb-8 ${
        step === 2 ? "max-w-[min(100%,1680px)] px-1 sm:px-2" : "max-w-3xl"
      }`}
    >
      <div className="rounded-2xl border border-teal-200 bg-teal-50/50 px-5 py-4 shadow-sm sm:px-7">
        <p className="text-sm font-medium text-teal-900">
          Instruction module — Part {step} of 2
        </p>
        <p className="mt-1 text-sm text-teal-800/90">
          {step === 1
            ? "Read the explanation, then write what you took away in your own words."
            : "Read the definitions on the left, then connect each dimension to the example that fits it best."}
        </p>
      </div>

      {step === 1 && (
        <section className="rounded-2xl border border-student-border bg-student-card px-5 py-6 shadow-student sm:px-8 sm:py-7">
          <h2 className="text-xl font-semibold tracking-tight text-student-ink">
            Part 1: {TRAINING_SECTIONS[0].title}
          </h2>
          <div className="mt-4 space-y-4 text-base font-medium leading-relaxed text-student-ink">
            {TRAINING_SECTIONS[0].paragraphs.map((p, j) => (
              <ParagraphBlock key={j} p={p} />
            ))}
            {TRAINING_SECTIONS[0].bullets && (
              <ul className="list-none space-y-2 border-l-4 border-teal-200 pl-4">
                {TRAINING_SECTIONS[0].bullets.map((item, j) => (
                  <li key={j} className="text-student-ink">
                    <span className="mr-2 font-medium text-teal-700">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            )}
            {TRAINING_SECTIONS[0].note && (
              <p className="rounded-xl bg-amber-50/90 px-4 py-3 text-[0.95rem] text-student-ink">
                {TRAINING_SECTIONS[0].note}
              </p>
            )}
          </div>

          <div className="mt-8">
            <label className="text-sm font-semibold text-student-ink">
              In your own words, what did you learn from Part 1? (at least a few
              sentences)
            </label>
            <textarea
              value={selfExplanation}
              onChange={(e) => setSelfExplanation(e.target.value)}
              rows={6}
              className="mt-2 w-full rounded-xl border border-student-border px-3 py-3 text-sm font-medium text-student-ink focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              placeholder="Explain in your own words — this helps us know you engaged with the material."
            />
            <p className="mt-1 text-xs text-student-muted">
              Minimum 40 characters ({selfExplanation.trim().length}/40)
            </p>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              disabled={!part1Complete}
              onClick={() => {
                setStep(2);
                window.scrollTo(0, 0);
              }}
              className="rounded-2xl bg-teal-600 px-8 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue to Part 2
            </button>
          </div>
        </section>
      )}

      {step === 2 && (
        <>
          <div className="grid min-w-0 gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-14 lg:items-start">
            <section className="min-w-0 rounded-2xl border border-student-border bg-student-card px-5 py-6 shadow-student sm:px-8 sm:py-8">
              <h2 className="text-xl font-semibold tracking-tight text-student-ink">
                Part 2: {part2.title}
              </h2>
              <div className="mt-4 space-y-4 text-base font-medium leading-relaxed text-student-ink">
                {part2.paragraphs.map((p, j) => (
                  <ParagraphBlock key={j} p={p} />
                ))}
              </div>
              <div className="mt-6 space-y-5">
                {INSTRUCTION_DIMENSIONS.map((dim) => (
                  <article
                    key={dim.key}
                    className="rounded-xl border-2 border-student-border bg-white px-4 py-4"
                  >
                    <h3 className="text-base font-semibold text-student-ink">
                      {dim.title}
                    </h3>
                    <ul className="mt-3 list-none space-y-2 text-sm font-medium leading-relaxed text-student-ink">
                      {dim.instructionBullets.map((line, i) => (
                        <li key={i} className="flex gap-2.5">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600" />
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 border-t border-student-border pt-3 text-sm font-medium leading-relaxed text-student-ink">
                      <span className="font-semibold text-student-ink">Example: </span>
                      {dim.example}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <div className="min-w-0 space-y-6">
              <section className="min-w-0 rounded-2xl border border-student-border bg-student-card px-5 py-6 shadow-student sm:px-8 sm:py-8">
                <h3 className="text-lg font-semibold text-student-ink">
                  Practice: connect each dimension to one example
                </h3>
                <p className="mt-2 text-sm font-medium leading-relaxed text-student-ink">
                  Each example below fits exactly one dimension. Use every example
                  once—links appear between columns on larger screens.
                </p>

                <div className="mt-6">
                  <DimensionConnectPractice
                    dimensions={INSTRUCTION_DIMENSIONS.map((d) => ({
                      key: d.key,
                      title: d.title,
                    }))}
                    examples={shuffledExamples}
                    matching={matching}
                    setMatching={setMatching}
                  />
                </div>

                {error && (
                  <p className="mt-6 text-sm font-medium text-red-600" role="alert">
                    {error}
                  </p>
                )}

                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      window.scrollTo(0, 0);
                    }}
                    className="rounded-2xl border border-student-border bg-white px-6 py-3 text-sm font-semibold text-student-ink hover:bg-student-canvas"
                  >
                    Back to Part 1
                  </button>
                  <button
                    type="button"
                    disabled={!allMatched || saving}
                    onClick={() => void handleFinish()}
                    className="rounded-2xl bg-teal-600 px-8 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-teal-700 disabled:opacity-50"
                  >
                    {saving ? "Saving…" : "Finish instruction & continue"}
                  </button>
                </div>
              </section>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
