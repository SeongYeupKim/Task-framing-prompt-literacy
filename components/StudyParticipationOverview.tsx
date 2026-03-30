"use client";

import { useState } from "react";
import type { StudyCondition } from "@/types/study";
import {
  PARTICIPATION_OVERVIEW_SHARED,
  participationOverviewSteps,
} from "@/lib/participationOverviewContent";
import {
  INFORMED_CONSENT_AGE_NOTICE,
  INFORMED_CONSENT_CLOSING,
  INFORMED_CONSENT_SECTIONS,
  INFORMED_CONSENT_TITLE,
} from "@/lib/informedConsentContent";

type Props = {
  condition: StudyCondition;
  onContinue: () => Promise<void>;
};

export function StudyParticipationOverview({
  condition,
  onContinue,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const steps = participationOverviewSteps(condition);

  async function handleClick() {
    setError(null);
    if (!confirmed) {
      setError("Please confirm that you have read the consent and overview.");
      return;
    }
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
      {/* Informed consent first (same copy as pre–sign-in); participation guidance follows. */}
      <h1 className="text-center text-xl font-semibold tracking-tight text-student-ink sm:text-2xl">
        Informed consent
      </h1>
      <p className="mt-2 text-center text-sm font-medium text-student-muted">
        Title of project: {INFORMED_CONSENT_TITLE}
      </p>

      <div className="mt-6 max-h-[min(55vh,480px)] space-y-5 overflow-y-auto border-b border-student-border pb-8 pr-1 text-sm font-medium leading-relaxed text-student-ink sm:max-h-[60vh] sm:text-base sm:leading-relaxed">
        {INFORMED_CONSENT_SECTIONS.map((section) => (
          <section key={section.heading}>
            <h2 className="text-base font-semibold text-student-ink">
              {section.heading}
            </h2>
            {section.paragraphs.map((p, i) => (
              <p key={i} className="mt-2">
                {p}
              </p>
            ))}
          </section>
        ))}
        <p className="font-semibold text-student-ink">{INFORMED_CONSENT_AGE_NOTICE}</p>
        <p className="text-student-ink">{INFORMED_CONSENT_CLOSING}</p>
      </div>

      <h2 className="mt-10 text-2xl font-semibold tracking-tight text-student-ink">
        {PARTICIPATION_OVERVIEW_SHARED.headline}
      </h2>
      <div className="mt-5 space-y-4 text-base font-medium leading-relaxed text-student-ink">
        {PARTICIPATION_OVERVIEW_SHARED.purpose.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        <p>{PARTICIPATION_OVERVIEW_SHARED.assignment}</p>
      </div>

      <h3 className="mt-8 text-lg font-semibold text-student-ink">
        What you&apos;ll do next
      </h3>
      <p className="mt-2 text-sm font-medium text-student-muted">
        Your session includes these steps (in order):
      </p>
      <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm font-medium leading-relaxed text-student-ink sm:text-base">
        {steps.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>

      <p className="mt-6 rounded-xl border border-teal-100 bg-teal-50/70 px-4 py-3 text-sm font-medium leading-relaxed text-teal-950">
        {PARTICIPATION_OVERVIEW_SHARED.time}
      </p>

      <label className="mt-8 flex cursor-pointer items-start gap-3 text-sm font-medium text-student-ink sm:text-base">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 shrink-0 rounded border-student-border text-teal-600 focus:ring-teal-500"
          checked={confirmed}
          onChange={(e) => {
            setConfirmed(e.target.checked);
            setError(null);
          }}
        />
        <span>
          I am age 18 or older. I have read the informed consent above and the
          participation overview below, and I voluntarily agree to continue with this
          study session.
        </span>
      </label>

      {error && (
        <p className="mt-4 text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          disabled={busy || !confirmed}
          onClick={() => void handleClick()}
          className="rounded-2xl bg-teal-600 px-8 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Continuing…" : "Continue"}
        </button>
      </div>
    </div>
  );
}
