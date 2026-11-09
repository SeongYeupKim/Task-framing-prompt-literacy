"use client";

import { useEffect, useState } from "react";
import {
  CARE_CASE,
  CARE_CASE_SCALE,
  CARE_INSTRUCTION,
  CARE_MIN_CHARS,
  CARE_QUESTIONS,
  type CareLetter,
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

function CareReading({
  onOpened,
}: {
  onOpened?: (letter: CareLetter) => void;
}) {
  const [openLetters, setOpenLetters] = useState<CareLetter[]>([]);

  function toggle(letter: CareLetter) {
    setOpenLetters((current) =>
      current.includes(letter)
        ? current.filter((item) => item !== letter)
        : [...current, letter],
    );
    onOpened?.(letter);
  }

  const openDimensions = CARE_INSTRUCTION.dimensions.filter((dim) =>
    openLetters.includes(dim.letter),
  );

  return (
    <div>
      <h2 className="text-xl font-semibold leading-snug text-student-ink">
        {CARE_INSTRUCTION.title}
      </h2>
      <p className="mt-3 text-base leading-6 text-student-ink">
        <span className="font-semibold">Definition of prompting literacy: </span>
        {CARE_INSTRUCTION.definition}
      </p>
      <p className="mt-2 text-base leading-6 text-student-ink">
        <span className="font-semibold">Why it matters: </span>
        {CARE_INSTRUCTION.why}
      </p>
      <p className="mt-2 text-base leading-6 text-student-ink">
        {CARE_INSTRUCTION.guide}
      </p>
      <div className="mt-4 grid items-start gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <div className="space-y-2 lg:sticky lg:top-24">
          {CARE_INSTRUCTION.dimensions.map((dim) => {
            const isOpen = openLetters.includes(dim.letter);
            return (
              <button
                key={dim.letter}
                type="button"
                aria-expanded={isOpen}
                onClick={() => toggle(dim.letter)}
                className={`relative flex w-full items-center gap-3 overflow-hidden rounded-md border bg-white px-3 py-3 pr-7 text-left shadow-sm ${
                  isOpen
                    ? "border-navy-800"
                    : "border-student-border hover:border-navy-200"
                }`}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute right-0 top-0 border-b-[16px] border-l-[16px] border-b-navy-100 border-l-transparent"
                />
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy-800 text-sm font-semibold text-white">
                  {dim.letter}
                </span>
                <span className="text-sm font-semibold leading-5 text-student-ink">
                  {dim.title}
                </span>
                <span className="ml-auto shrink-0 text-sm font-medium text-navy-800">
                  {isOpen ? "Fold" : "Unfold"}
                </span>
              </button>
            );
          })}
        </div>
        <div className="min-h-[16rem] space-y-3">
          {openDimensions.length === 0 ? (
            <p className="rounded-md border border-dashed border-navy-200 bg-white px-4 py-6 text-base leading-6 text-student-muted">
              Unfold a dimension. Its explanation stays in this column until
              you fold it.
            </p>
          ) : (
            openDimensions.map((dim) => (
              <article
                key={dim.letter}
                className="rounded-md border border-student-border bg-white shadow-sm"
              >
                <div className="flex items-center gap-3 border-b border-student-border px-4 py-2.5">
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy-800 text-sm font-semibold text-white">
                    {dim.letter}
                  </span>
                  <h3 className="text-base font-semibold text-student-ink">
                    {dim.title}
                  </h3>
                  <button
                    type="button"
                    onClick={() => toggle(dim.letter)}
                    className="ml-auto text-sm font-medium text-navy-800"
                  >
                    Fold
                  </button>
                </div>
                <div className="space-y-3 px-4 py-3 text-sm leading-6 text-student-ink">
                  <p>{dim.definition}</p>
                  {dim.priorAi && (
                    <div className="rounded-md border border-student-border bg-student-canvas px-3 py-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-student-muted">
                        The AI has already replied
                      </p>
                      <p className="mt-1">{dim.priorAi}</p>
                    </div>
                  )}
                  <p>
                    <span className="font-semibold">
                      {dim.priorAi ? "A weak next message: " : "A weak move: "}
                    </span>
                    {dim.weak}
                  </p>
                  <p>
                    <span className="font-semibold">
                      {dim.priorAi
                        ? "A stronger next message: "
                        : "A stronger move: "}
                    </span>
                    {dim.stronger}
                  </p>
                  {dim.note && (
                    <p className="text-xs leading-5 text-student-muted">
                      {dim.note}
                    </p>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
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

function AnswerField({
  prompt,
  value,
  onChange,
  min,
  rows = 4,
}: {
  prompt: string;
  value: string;
  onChange: (value: string) => void;
  min: number;
  rows?: number;
}) {
  return (
    <div className="mt-4 border-t border-student-border pt-3">
      <p className="text-base leading-6 text-student-ink">{prompt}</p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="mt-2 w-full rounded-md border border-student-border px-3 py-3 text-base leading-6 text-student-ink focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-700/20"
      />
      <CharCount value={value} min={min} />
    </div>
  );
}

export function TrainingPanel({ condition, studyUid, onComplete }: Props) {
  const withQuestions = needsSelfExplanation(condition);

  useEffect(() => {
    void recordTrainingModuleEntered(studyUid);
  }, [studyUid]);

  const [step, setStep] = useState<1 | 2>(1);
  const [opened, setOpened] = useState<CareLetter[]>([]);
  const [readConfirmed, setReadConfirmed] = useState(false);
  const [definition, setDefinition] = useState("");
  const [distinction, setDistinction] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [judgment, setJudgment] = useState("");
  const [advice, setAdvice] = useState("");
  const [revisedOpening, setRevisedOpening] = useState("");
  const [nextMessage, setNextMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allOpened = CARE_INSTRUCTION.dimensions.every((dim) =>
    opened.includes(dim.letter),
  );

  const questionsComplete =
    definition.trim().length >= CARE_MIN_CHARS.definition &&
    distinction.trim().length >= CARE_MIN_CHARS.distinction &&
    rating !== null &&
    judgment.trim().length >= CARE_MIN_CHARS.judgment &&
    advice.trim().length >= CARE_MIN_CHARS.advice &&
    revisedOpening.trim().length >= CARE_MIN_CHARS.revisedOpening &&
    nextMessage.trim().length >= CARE_MIN_CHARS.nextMessage;

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
            ? "Start with the definition. Unfold a dimension to read it on the right. It stays there until you fold it."
            : "Answer in your own words. Open “Reread the instruction” if you want a dimension again."}
        </p>
      </div>

      {step === 1 && (
        <section className="rounded-md border border-student-border bg-student-card px-4 py-4 shadow-student sm:px-5">
          <CareReading
            onOpened={(letter) =>
              setOpened((prev) =>
                prev.includes(letter) ? prev : [...prev, letter],
              )
            }
          />
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
              disabled={!allOpened}
              onChange={(e) => setReadConfirmed(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-student-border text-navy-800 focus:ring-navy-700 disabled:cursor-not-allowed"
            />
            <span>
              I have read this instruction.
              {!allOpened && (
                <span className="mt-1 block text-sm leading-5 text-student-muted">
                  Unfold each of the four dimensions first.
                </span>
              )}
            </span>
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

          <article className="rounded-md border border-student-border bg-student-card px-4 py-4 shadow-student xl:col-span-2">
            <h3 className="text-lg font-semibold text-student-ink">
              3. Rate this chat
            </h3>
            <p className="mt-2 text-base leading-6 text-student-ink">
              A student was asked to do this:
            </p>
            <p className="mt-3 border border-student-border bg-navy-50 px-4 py-3 text-base leading-6 text-student-ink">
              {CARE_CASE.assignment}
            </p>
            <div className="mt-3 space-y-2">
              {CARE_CASE.turns.map((turn, i) => (
                <div
                  key={i}
                  className={
                    turn.role === "student"
                      ? "ml-8 rounded-md bg-navy-800 px-4 py-3 text-sm leading-6 text-white"
                      : "mr-8 rounded-md border border-student-border bg-white px-4 py-3 text-sm leading-6 text-student-ink"
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
            <div className="mt-4 border-t border-student-border pt-3">
              <p className="text-base leading-6 text-student-ink">
                {CARE_QUESTIONS.rating}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {CARE_CASE_SCALE.map(({ value, label }) => (
                  <label
                    key={value}
                    className={`flex min-w-[5.5rem] cursor-pointer flex-col items-center rounded-md border px-2 py-2 text-center ${
                      rating === value
                        ? "border-navy-800 bg-navy-50"
                        : "border-student-border bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="care-case-rating"
                      value={value}
                      checked={rating === value}
                      onChange={() => setRating(value)}
                      className="sr-only"
                    />
                    <span className="text-base font-semibold tabular-nums leading-none text-navy-800">
                      {value}
                    </span>
                    <span className="mt-1 text-xs leading-4 text-student-muted">
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <AnswerField
              prompt={CARE_QUESTIONS.reason}
              value={judgment}
              onChange={setJudgment}
              min={CARE_MIN_CHARS.judgment}
            />
          </article>

          <article className="rounded-md border border-student-border bg-student-card px-4 py-4 shadow-student xl:col-span-2">
            <h3 className="text-lg font-semibold text-student-ink">
              4. Advise this student
            </h3>
            <p className="mt-2 text-base leading-6 text-student-ink">
              Use the same chat. Answer each part in its own box.
            </p>
            <AnswerField
              prompt={CARE_QUESTIONS.advice}
              value={advice}
              onChange={setAdvice}
              min={CARE_MIN_CHARS.advice}
            />
            <AnswerField
              prompt={CARE_QUESTIONS.revisedOpening}
              value={revisedOpening}
              onChange={setRevisedOpening}
              min={CARE_MIN_CHARS.revisedOpening}
            />
            <AnswerField
              prompt={CARE_QUESTIONS.nextMessage}
              value={nextMessage}
              onChange={setNextMessage}
              min={CARE_MIN_CHARS.nextMessage}
            />
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
              onClick={() => {
                if (rating === null) return;
                void finish({
                  definition: definition.trim(),
                  distinction: distinction.trim(),
                  rating,
                  judgment: judgment.trim(),
                  advice: advice.trim(),
                  revisedOpening: revisedOpening.trim(),
                  nextMessage: nextMessage.trim(),
                });
              }}
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
