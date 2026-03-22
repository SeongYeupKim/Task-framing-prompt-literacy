"use client";

import { useState } from "react";
import type { DemographicsSubmission } from "@/types/study";
import {
  DEMOGRAPHICS_GENDER_OPTIONS,
  DEMOGRAPHICS_RACE_OPTIONS,
} from "@/lib/demographicsOptions";
import { isPennStateEmail } from "@/lib/psuEmail";

type Props = {
  onSubmit: (data: DemographicsSubmission) => Promise<void>;
};

function toggleInList(list: string[], value: string): string[] {
  if (list.includes(value)) return list.filter((x) => x !== value);
  return [...list, value];
}

export function DemographicsSurvey({ onSubmit }: Props) {
  const [psuEmail, setPsuEmail] = useState("");
  const [ageYears, setAgeYears] = useState("");
  const [gender, setGender] = useState<string[]>([]);
  const [raceEthnicity, setRaceEthnicity] = useState<string[]>([]);
  const [nameForCredit, setNameForCredit] = useState("");
  const [followUp, setFollowUp] = useState<"yes" | "no" | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!psuEmail.trim()) {
      setError("Please enter your PSU email.");
      return;
    }
    if (!isPennStateEmail(psuEmail)) {
      setError("Email must be a Penn State address (e.g., abc123@psu.edu).");
      return;
    }
    if (!ageYears.trim()) {
      setError("Please enter your age in years.");
      return;
    }
    const ageNum = parseInt(ageYears.trim(), 10);
    if (Number.isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
      setError("Please enter a valid age in years (numbers only).");
      return;
    }
    if (gender.length === 0) {
      setError("Please select at least one option for gender (or “Prefer not to answer”).");
      return;
    }
    if (raceEthnicity.length === 0) {
      setError(
        "Please select at least one option for race/ethnicity (or “Prefer not to answer”)."
      );
      return;
    }
    if (!nameForCredit.trim()) {
      setError("Please enter your name for course credit, or write “N/A” if not applicable.");
      return;
    }
    if (followUp === null) {
      setError("Please answer whether you are interested in a follow-up interview.");
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        psuEmail: psuEmail.trim().toLowerCase(),
        ageYears: ageYears.trim(),
        gender: [...gender],
        raceEthnicity: [...raceEthnicity],
        nameForCredit: nameForCredit.trim(),
        followUpInterview: followUp === "yes",
        submittedAt: new Date().toISOString(),
      });
    } catch {
      setError("Could not save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="mx-auto max-w-2xl space-y-10 pb-12"
    >
      <div className="rounded-2xl border border-student-border bg-student-card px-5 py-6 shadow-student sm:px-8">
        <h2 className="text-xl font-semibold text-student-ink">
          A few final questions
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-student-muted">
          Your answers help us describe the sample for this study. All fields
          below are required to continue.
        </p>
      </div>

      {/* 1 */}
      <section className="rounded-2xl border border-student-border bg-white px-5 py-6 shadow-sm sm:px-7">
        <h3 className="text-sm font-semibold text-student-ink">
          1. Please enter your PSU email address (e.g., abc123@psu.edu).
        </h3>
        <input
          type="email"
          autoComplete="email"
          value={psuEmail}
          onChange={(e) => setPsuEmail(e.target.value)}
          placeholder="abc123@psu.edu"
          className="mt-3 w-full rounded-xl border border-student-border px-3 py-2.5 text-sm text-student-ink focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
        />
        <p className="mt-2 text-xs leading-relaxed text-student-muted">
          <strong className="text-student-ink">Note:</strong> Your PSU email
          will be replaced with a unique, anonymous ID, so your responses will
          be de-identified.
        </p>
      </section>

      {/* 2 */}
      <section className="rounded-2xl border border-student-border bg-white px-5 py-6 shadow-sm sm:px-7">
        <h3 className="text-sm font-semibold text-student-ink">
          2. Please enter your age in years below.
        </h3>
        <input
          type="text"
          inputMode="numeric"
          value={ageYears}
          onChange={(e) => setAgeYears(e.target.value.replace(/\D/g, ""))}
          placeholder="e.g., 20"
          className="mt-3 w-full max-w-[12rem] rounded-xl border border-student-border px-3 py-2.5 text-sm text-student-ink focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
        />
      </section>

      {/* 3 */}
      <section className="rounded-2xl border border-student-border bg-white px-5 py-6 shadow-sm sm:px-7">
        <h3 className="text-sm font-semibold text-student-ink">
          3. Which of the following best describes your gender? Select all that
          apply.
        </h3>
        <ul className="mt-4 space-y-2">
          {DEMOGRAPHICS_GENDER_OPTIONS.map((opt) => (
            <li key={opt}>
              <label className="flex cursor-pointer items-start gap-3 text-sm text-student-ink">
                <input
                  type="checkbox"
                  checked={gender.includes(opt)}
                  onChange={() => setGender((g) => toggleInList(g, opt))}
                  className="mt-1 h-4 w-4 shrink-0 rounded border-student-border text-teal-600 focus:ring-teal-500"
                />
                <span>{opt}</span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      {/* 4 */}
      <section className="rounded-2xl border border-student-border bg-white px-5 py-6 shadow-sm sm:px-7">
        <h3 className="text-sm font-semibold text-student-ink">
          4. Which of the following best describes your race/ethnicity? Select
          all that apply.
        </h3>
        <ul className="mt-4 space-y-2">
          {DEMOGRAPHICS_RACE_OPTIONS.map((opt) => (
            <li key={opt}>
              <label className="flex cursor-pointer items-start gap-3 text-sm text-student-ink">
                <input
                  type="checkbox"
                  checked={raceEthnicity.includes(opt)}
                  onChange={() =>
                    setRaceEthnicity((r) => toggleInList(r, opt))
                  }
                  className="mt-1 h-4 w-4 shrink-0 rounded border-student-border text-teal-600 focus:ring-teal-500"
                />
                <span>{opt}</span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      {/* 5 */}
      <section className="rounded-2xl border border-student-border bg-white px-5 py-6 shadow-sm sm:px-7">
        <h3 className="text-sm font-semibold text-student-ink">
          5. Please identify your name to get an extra course credit.
        </h3>
        <input
          type="text"
          autoComplete="name"
          value={nameForCredit}
          onChange={(e) => setNameForCredit(e.target.value)}
          placeholder="Your name as it appears on the course roster"
          className="mt-3 w-full rounded-xl border border-student-border px-3 py-2.5 text-sm text-student-ink focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
        />
      </section>

      {/* 6 */}
      <section className="rounded-2xl border border-student-border bg-white px-5 py-6 shadow-sm sm:px-7">
        <h3 className="text-sm font-semibold text-student-ink">
          6. Do you have any intention for the follow-up interview with respect
          to your task? Additional compensation will be provided.
        </h3>
        <div className="mt-4 flex flex-wrap gap-6">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-student-ink">
            <input
              type="radio"
              name="followup"
              checked={followUp === "yes"}
              onChange={() => setFollowUp("yes")}
              className="h-4 w-4 border-student-border text-teal-600 focus:ring-teal-500"
            />
            Yes
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-student-ink">
            <input
              type="radio"
              name="followup"
              checked={followUp === "no"}
              onChange={() => setFollowUp("no")}
              className="h-4 w-4 border-student-border text-teal-600 focus:ring-teal-500"
            />
            No
          </label>
        </div>
      </section>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="flex justify-center">
        <button
          type="submit"
          disabled={saving}
          className="rounded-2xl bg-teal-600 px-8 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Submit and finish"}
        </button>
      </div>
    </form>
  );
}
