"use client";

import { useState } from "react";
import {
  INFORMED_CONSENT_AGE_NOTICE,
  INFORMED_CONSENT_CLOSING,
  INFORMED_CONSENT_SECTIONS,
  INFORMED_CONSENT_TITLE,
} from "@/lib/informedConsentContent";

type Props = {
  onAccepted: () => void;
  showPrintHint?: boolean;
  /** `home`: before account; `study`: first screen after sign-in. */
  variant?: "home" | "study";
};

export function InformedConsentScreen({
  onAccepted,
  showPrintHint = true,
  variant = "home",
}: Props) {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <main className="min-h-screen bg-student-canvas px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl rounded-2xl border border-student-border bg-student-card px-6 py-8 shadow-student sm:px-10 sm:py-10 print:border-0 print:shadow-none">
        <h1 className="text-center text-xl font-semibold tracking-tight text-student-ink sm:text-2xl">
          Informed consent
        </h1>
        <p className="mt-2 text-center text-sm font-medium text-student-muted">
          Title of project: {INFORMED_CONSENT_TITLE}
        </p>
        {variant === "home" ? (
          <p className="mt-3 text-center text-sm font-semibold text-teal-900">
            Step 1 — finish this page before you sign in or create an account.
          </p>
        ) : (
          <p className="mt-3 text-center text-sm font-semibold text-teal-900">
            You are signed in. Confirm below to open the next page: a short
            overview of your session.
          </p>
        )}

        <div className="mt-8 max-h-[min(60vh,520px)] space-y-6 overflow-y-auto pr-1 text-sm font-medium leading-relaxed text-student-ink sm:max-h-none sm:overflow-visible sm:text-base sm:leading-relaxed">
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
          <p className="font-semibold text-student-ink">
            {INFORMED_CONSENT_AGE_NOTICE}
          </p>
          <p className="text-student-ink">{INFORMED_CONSENT_CLOSING}</p>
          {showPrintHint && (
            <p className="text-sm text-student-muted">
              To keep a copy, use your browser’s print or “Save as PDF” on this
              page.
            </p>
          )}
        </div>

        <div className="mt-8 space-y-4 border-t border-student-border pt-6">
          <label className="flex cursor-pointer items-start gap-3 text-sm font-medium text-student-ink sm:text-base">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 shrink-0 rounded border-student-border text-teal-600 focus:ring-teal-500"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            <span>
              I am age 18 or older. I have read the information above and I
              voluntarily consent to participate in this research.
            </span>
          </label>
          <button
            type="button"
            disabled={!confirmed}
            onClick={onAccepted}
            className="w-full rounded-2xl bg-teal-600 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continue
          </button>
        </div>
      </div>
    </main>
  );
}
