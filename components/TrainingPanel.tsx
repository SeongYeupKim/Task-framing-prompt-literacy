"use client";

import { useEffect, useState } from "react";
import {
  CARE_CASE,
  CARE_INSTRUCTION,
  CARE_MIN_CHARS,
  CARE_QUESTIONS,
} from "@/lib/studyContent";
import { needsSelfExplanation } from "@/lib/studyConditions";
import type { CareSelfExplanationAnswers, StudyCondition } from "@/types/study";
import {
  recordInstructionPart2Start,
  recordTrainingModuleEntered,
} from "@/lib/userStudy";

type Props = {
  condition: StudyCondition;
  studyUid: string;
  onComplete: (answers: CareSelfExplanationAnswers | null) => Promise<void>;
};

function CareReading() {
  return (
    <>
      <h2 className="text-xl font-semibold leading-snug text-student-ink">
        {CARE_INSTRUCTION.title}
      </h2>
      <p className="mt-2 text-base leading-6 text-student-ink">
        <span className="font-semibold">Definition of prompting literacy: </span>
        {CARE_INSTRUCTION.definition}
      </p>
      <p className="mt-2 text-base leading-6 text-student-ink">
        {CARE_INSTRUCTION.intro}
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {CARE_INSTRUCTION.dimensions.map((dim) => (
          <article
            key={dim.letter}
            className="border border-student-border bg-white px-4 py-3"
          >
            <h3 className="text-base font-semibold leading-snug text-student-ink">
              <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-navy-800 text-xs font-semibold text-white">
                {dim.letter}
              </span>
              {dim.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-student-ink">
              {dim.definition}
            </p>
            <p className="mt-2 text-sm leading-5 text-student-ink">
              <span className="font-semibold">A weak move: </span>
              {dim.weak}
            </p>
            <p className="mt-1 text-sm leading-5 text-student-ink">
              <span className="font-semibold">A stronger move: </span>
              {dim.stronger}
            </p>
          </article>
        ))}
      </div>
      <p className="mt-3 text-sm leading-5 text-student-muted">
        <span className="font-semibold text-student-ink">
          {CARE_INSTRUCTION.contrastTitle}:{" "}
        </span>
        {CARE_INSTRUCTION.contrast}
      </p>
    </>
  );
}

function CharCount({ value, min }: { value: string; min: number }) {
  const n = value.trim().length;
  return (
    <p className="mt-1 text-xs text-student-muted">
      Minimum {min} characters ({n}/{min})
    </p>
  );
}

export function TrainingPanel({ condition, studyUid, onComplete }: Props) {
  const withQuestions = needsSelfExplanation(condition);

  useEffect(() => {
    void recordTrainingModuleEntered(studyUid);
  }, [studyUid]);

  const [step, setStep] = useState<1 | 2>(1);
  const [readConfirmed, setReadConfirmed] = useState(false);
  const [definition, setDefinition] = useState("");
  const [distinction, setDistinction] = useState("");
  const [judgment, setJudgment] = useState("");
  const [advice, setAdvice] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const questionsComplete =
    definition.trim().length >= CARE_MIN_CHARS.definition &&
    distinction.trim().length >= CARE_MIN_CHARS.distinction &&
    judgment.trim().length >= CARE_MIN_CHARS.judgment &&
    advice.trim().length >= CARE_MIN_CHARS.advice;

  async function finish(answers: CareSelfExplanationAnswers | null) {
    setError(null);
    setSaving(true);
    try {
      await onComplete(answers);
    } catch {
      setError("Could not save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full space-y-3 pb-6">
      <div className="rounded-md border border-navy-200 bg-navy-50 px-5 py-4 shadow-sm sm:px-7">
        <p className="text-base font-semibold text-navy-900">
          {withQuestions ? `Instruction — Part ${step} of 2` : "Instruction"}
        </p>
        <p className="mt-2 text-base leading-7 text-student-ink">
          {step === 1
            ? "Read the explanation. Both parts of prompting are covered: how you build a request, and what you do after the AI answers."
            : "Answer in your own words. Open “Reread the instruction” if you want the text again."}
        </p>
      </div>

      {step === 1 && (
        <section className="rounded-md border border-student-border bg-student-card px-4 py-4 shadow-student sm:px-5">
          <CareReading />
        </section>
      )}

      {step === 2 && withQuestions && (
        <details className="rounded-md border border-student-border bg-student-card px-5 py-4 shadow-student sm:px-8">
          <summary className="cursor-pointer text-sm font-semibold text-navy-800">
            Reread the instruction
          </summary>
          <div className="mt-4 border-t border-student-border pt-4">
            <CareReading />
          </div>
        </details>
      )}

      {step === 1 && (
        <section className="rounded-md border border-student-border bg-student-card px-5 py-6 shadow-student sm:px-8">
          <label className="flex items-start gap-3 text-base leading-7 text-student-ink">
            <input
              type="checkbox"
              checked={readConfirmed}
              onChange={(e) => setReadConfirmed(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-student-border text-navy-800 focus:ring-navy-700"
            />
            <span>I have read this instruction.</span>
          </label>
          {error && (
            <p className="mt-4 text-sm font-medium text-red-600" role="alert">
              {error}
            </p>
          )}
          <div className="mt-6 flex justify-end">
            {withQuestions ? (
              <button
                type="button"
                disabled={!readConfirmed}
                onClick={() => {
                  void recordInstructionPart2Start(studyUid);
                  setStep(2);
                  window.scrollTo(0, 0);
                }}
                className="rounded-md bg-navy-800 px-8 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-navy-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continue to the questions
              </button>
            ) : (
              <button
                type="button"
                disabled={!readConfirmed || saving}
                onClick={() => void finish(null)}
                className="rounded-md bg-navy-800 px-8 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-navy-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving…" : "Continue"}
              </button>
            )}
          </div>
        </section>
      )}

      {step === 2 && withQuestions && (
        <>
        <section className="grid gap-3 xl:grid-cols-2">
          <article className="rounded-md border border-student-border bg-student-card px-4 py-4 shadow-student">
            <h3 className="text-lg font-semibold text-student-ink">
              1. Your definition
            </h3>
            <p className="mt-2 text-base leading-7 text-student-ink">
              {CARE_QUESTIONS.definition}
            </p>
            <textarea
              value={definition}
              onChange={(e) => setDefinition(e.target.value)}
              rows={5}
              className="mt-3 w-full rounded-md border border-student-border px-3 py-3 text-base leading-7 text-student-ink focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-700/20"
            />
            <CharCount value={definition} min={CARE_MIN_CHARS.definition} />
          </article>

          <article className="rounded-md border border-student-border bg-student-card px-4 py-4 shadow-student">
            <h3 className="text-lg font-semibold text-student-ink">
              2. Articulation
            </h3>
            <p className="mt-2 text-base leading-6 text-student-ink">
              {CARE_QUESTIONS.articulation}
            </p>
            <textarea
              value={distinction}
              onChange={(e) => setDistinction(e.target.value)}
              rows={5}
              className="mt-3 w-full rounded-md border border-student-border px-3 py-3 text-base leading-6 text-student-ink focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-700/20"
            />
            <CharCount value={distinction} min={CARE_MIN_CHARS.distinction} />
          </article>

          <article className="rounded-md border border-student-border bg-student-card px-4 py-4 shadow-student">
            <h3 className="text-lg font-semibold text-student-ink">
              3. Judge this chat
            </h3>
            <p className="mt-2 text-base leading-7 text-student-ink">
              A student was asked to do this:
            </p>
            <p className="mt-4 border border-student-border bg-navy-50 px-5 py-4 text-base leading-7 text-student-ink">
              {CARE_CASE.assignment}
            </p>
            <div className="mt-5 space-y-4">
              {CARE_CASE.turns.map((turn, i) => (
                <div
                  key={i}
                  className={
                    turn.role === "student"
                      ? "ml-8 rounded-md bg-navy-800 px-4 py-4 text-base leading-7 text-white"
                      : "mr-8 rounded-md border border-student-border bg-white px-4 py-4 text-base leading-7 text-student-ink"
                  }
                >
                  <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
                    {turn.role === "student" ? "Student" : "AI"}
                  </p>
                  <p className="mt-1">{turn.content}</p>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-student-muted">The chat ends here.</p>
            <p className="mt-4 text-base leading-7 text-student-ink">
              {CARE_QUESTIONS.judgment}
            </p>
            <textarea
              value={judgment}
              onChange={(e) => setJudgment(e.target.value)}
              rows={5}
              className="mt-3 w-full rounded-md border border-student-border px-3 py-3 text-base leading-7 text-student-ink focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-700/20"
            />
            <CharCount value={judgment} min={CARE_MIN_CHARS.judgment} />
          </article>

          <article className="rounded-md border border-student-border bg-student-card px-4 py-4 shadow-student">
            <h3 className="text-lg font-semibold text-student-ink">
              4. Advise this student
            </h3>
            <p className="mt-2 text-base leading-7 text-student-ink">
              {CARE_QUESTIONS.advice}
            </p>
            <textarea
              value={advice}
              onChange={(e) => setAdvice(e.target.value)}
              rows={7}
              className="mt-3 w-full rounded-md border border-student-border px-3 py-3 text-base leading-7 text-student-ink focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-700/20"
            />
            <CharCount value={advice} min={CARE_MIN_CHARS.advice} />
          </article>
        </section>

          {error && (
            <p className="text-sm font-medium text-red-600" role="alert">
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                setStep(1);
                window.scrollTo(0, 0);
              }}
              className="rounded-md border border-student-border bg-white px-6 py-3 text-sm font-semibold text-student-ink hover:bg-student-canvas"
            >
              Back to the instruction
            </button>
            <button
              type="button"
              disabled={!questionsComplete || saving}
              onClick={() =>
                void finish({
                  definition: definition.trim(),
                  distinction: distinction.trim(),
                  judgment: judgment.trim(),
                  advice: advice.trim(),
                })
              }
              className="rounded-md bg-navy-800 px-8 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-navy-900 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Finish and continue"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
