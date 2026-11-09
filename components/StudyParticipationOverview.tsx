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
    <div className="mx-auto max-w-3xl rounded-md border border-student-border bg-student-card px-6 py-8 shadow-student sm:px-10 sm:py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-student-ink">
        {PARTICIPATION_OVERVIEW_SHARED.headline}
      </h1>
      <div className="mt-6 space-y-5 text-base leading-7 text-student-ink">
        {PARTICIPATION_OVERVIEW_SHARED.purpose.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        <p>{PARTICIPATION_OVERVIEW_SHARED.assignment}</p>
      </div>

      <h2 className="mt-8 text-lg font-semibold text-student-ink">
        What you&apos;ll do in this session
      </h2>
      <p className="mt-3 text-base leading-7 text-student-muted">
        After informed consent, your steps proceed on separate screens, in this
        order:
      </p>
      <ol className="mt-5 list-decimal space-y-4 pl-5 text-base leading-7 text-student-ink">
        {steps.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>

      <p className="mt-8 rounded-md border border-navy-100 bg-navy-50 px-5 py-4 text-base leading-7 text-navy-900">
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
          className="rounded-md bg-navy-800 px-8 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-navy-900 disabled:opacity-50"
        >
          {busy ? "Continuing…" : "Continue"}
        </button>
      </div>
    </div>
  );
}
