"use client";

import { useMemo, useState } from "react";
import {
  TRAINING_SECTIONS,
  INSTRUCTION_DIMENSIONS,
  INSTRUCTION_MATCHING_POOL,
  type TextChunk,
} from "@/lib/studyContent";
import type { InstructionPracticeData } from "@/types/study";

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
      });
    } catch {
      setError("Could not save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-8">
      <div className="rounded-2xl border border-teal-200 bg-teal-50/50 px-5 py-4 shadow-sm sm:px-7">
        <p className="text-sm font-medium text-teal-900">
          Instruction module — Part {step} of 2
        </p>
        <p className="mt-1 text-sm text-teal-800/90">
          {step === 1
            ? "Read the explanation, then write what you took away in your own words."
            : "Read about the six dimensions, then match each dimension to the example that fits it best."}
        </p>
      </div>

      {step === 1 && (
        <section className="rounded-2xl border border-student-border bg-student-card px-5 py-6 shadow-student sm:px-8 sm:py-7">
          <h2 className="text-xl font-semibold tracking-tight text-student-ink">
            Part 1: {TRAINING_SECTIONS[0].title}
          </h2>
          <div className="mt-4 space-y-4 text-base leading-relaxed text-student-ink">
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
              className="mt-2 w-full rounded-xl border border-student-border px-3 py-3 text-sm text-student-ink focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
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
        <section className="rounded-2xl border border-student-border bg-student-card px-5 py-6 shadow-student sm:px-8 sm:py-7">
          <h2 className="text-xl font-semibold tracking-tight text-student-ink">
            Part 2: {part2.title}
          </h2>
          <div className="mt-4 space-y-4 text-base leading-relaxed text-student-ink">
            {part2.paragraphs.map((p, j) => (
              <ParagraphBlock key={j} p={p} />
            ))}
            {part2.numbered && (
              <ol className="mt-2 space-y-3">
                {part2.numbered.map((item, j) => (
                  <li
                    key={j}
                    className="flex gap-3 rounded-xl bg-teal-50/60 px-3 py-3 text-student-ink"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-600 text-xs font-semibold text-white">
                      {j + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="font-semibold text-student-ink">
                        {item.title}
                      </span>
                      <span className="text-student-muted"> — {item.detail}</span>
                    </span>
                  </li>
                ))}
              </ol>
            )}
            {part2.note && (
              <p className="rounded-xl bg-amber-50/90 px-4 py-3 text-[0.95rem] text-student-ink">
                {part2.note}
              </p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-student-border bg-student-card px-5 py-6 shadow-student sm:px-8 sm:py-7">
          <h3 className="text-lg font-semibold text-student-ink">
            Practice: match each dimension to one example
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-student-muted">
            For each dimension, choose the example that best illustrates that
            aspect of task framing. Each example below is used exactly once.
          </p>

          <div className="mt-6 space-y-6">
            {INSTRUCTION_DIMENSIONS.map((dim) => (
              <div key={dim.key} className="rounded-xl border border-student-border bg-white px-4 py-3">
                <p className="text-sm font-semibold text-student-ink">
                  {dim.title}
                </p>
                <p className="text-xs text-student-muted">{dim.detail}</p>
                <label className="mt-2 block text-xs font-medium text-student-muted">
                  Which example fits this dimension?
                </label>
                <select
                  className="mt-1 w-full rounded-lg border border-student-border bg-student-canvas px-3 py-2 text-sm text-student-ink"
                  value={matching[dim.key] ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    setMatching((prev) => ({ ...prev, [dim.key]: v }));
                  }}
                >
                  <option value="">Choose an example…</option>
                  {shuffledExamples.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.prompt.slice(0, 100)}
                      {ex.prompt.length > 100 ? "…" : ""}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {error && (
            <p className="mt-6 text-sm text-red-600" role="alert">
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
      </>
      )}
    </div>
  );
}
