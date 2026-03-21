"use client";

import { TRAINING_SECTIONS } from "@/lib/studyContent";

export function TrainingPanel() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-2xl border border-student-border bg-student-card px-5 py-4 shadow-student sm:px-7 sm:py-5">
        <p className="text-base leading-relaxed text-student-muted">
          Read at your own pace. You can scroll back anytime. When you’re ready,
          use the button at the bottom to continue.
        </p>
      </div>

      {TRAINING_SECTIONS.map((s, i) => (
        <section
          key={s.title}
          className="rounded-2xl border border-student-border bg-student-card px-5 py-6 shadow-student sm:px-8 sm:py-7"
        >
          <h2 className="text-xl font-semibold tracking-tight text-student-ink">
            Part {i + 1}: {s.title}
          </h2>

          <div className="mt-4 space-y-4 text-base leading-relaxed text-student-ink">
            {s.paragraphs.map((p, j) => (
              <p key={j}>{p}</p>
            ))}

            {s.bullets && s.bullets.length > 0 && (
              <ul className="list-none space-y-2 border-l-4 border-teal-200 pl-4">
                {s.bullets.map((item, j) => (
                  <li key={j} className="text-student-ink">
                    <span className="mr-2 font-medium text-teal-700">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            )}

            {s.numbered && (
              <ol className="mt-2 space-y-3">
                {s.numbered.map((item, j) => (
                  <li
                    key={j}
                    className="flex gap-3 rounded-xl bg-teal-50/60 px-3 py-2.5 text-student-ink"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-600 text-xs font-semibold text-white">
                      {j + 1}
                    </span>
                    <span>
                      <span className="font-semibold text-student-ink">
                        {item.title}
                      </span>
                      <span className="text-student-muted"> — {item.detail}</span>
                    </span>
                  </li>
                ))}
              </ol>
            )}

            {s.note && (
              <p className="rounded-xl bg-amber-50/90 px-4 py-3 text-[0.95rem] text-student-ink">
                {s.note}
              </p>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
