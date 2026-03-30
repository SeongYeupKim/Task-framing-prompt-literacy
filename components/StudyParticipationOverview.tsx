"use client";

import { useState } from "react";
import type { StudyCondition } from "@/types/study";
import {
  PARTICIPATION_OVERVIEW_SHARED,
  participationOverviewSteps,
} from "@/lib/participationOverviewContent";

type Props = {
  condition: StudyCondition;
  onContinue: () => Promise<void>;
};

/**
 * Participation guidance only (informed consent is a separate phase/page).
 */
export function StudyParticipationOverview({
  condition,
  onContinue,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const steps = participationOverviewSteps(condition);

  async function handleClick() {
    setError(null);
    setBusy(true);
    try {
      await onContinue();
    } catch {
      setError("Could not continue. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl rounded-2xl border border-student-border bg-student-card px-6 py-8 shadow-student sm:px-10 sm:py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-student-ink">
        {PARTICIPATION_OVERVIEW_SHARED.headline}
      </h1>
      <div className="mt-5 space-y-4 text-base font-medium leading-relaxed text-student-ink">
        {PARTICIPATION_OVERVIEW_SHARED.purpose.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        <p>{PARTICIPATION_OVERVIEW_SHARED.assignment}</p>
      </div>

      <h2 className="mt-8 text-lg font-semibold text-student-ink">
        What you&apos;ll do in this session
      </h2>
      <p className="mt-2 text-sm font-medium text-student-muted">
        After informed consent, your steps proceed on separate screens, in this
        order:
      </p>
      <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm font-medium leading-relaxed text-student-ink sm:text-base">
        {steps.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>

      <p className="mt-6 rounded-xl border border-teal-100 bg-teal-50/70 px-4 py-3 text-sm font-medium leading-relaxed text-teal-950">
        {PARTICIPATION_OVERVIEW_SHARED.time}
      </p>

      {error && (
        <p className="mt-4 text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          disabled={busy}
          onClick={() => void handleClick()}
          className="rounded-2xl bg-teal-600 px-8 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:opacity-50"
        >
          {busy ? "Continuing…" : "Continue"}
        </button>
      </div>
    </div>
  );
}
