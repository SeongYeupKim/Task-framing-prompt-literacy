"use client";

import { TRAINING_SECTIONS } from "@/lib/studyContent";

export function TrainingPanel() {
  return (
    <div className="space-y-8">
      {TRAINING_SECTIONS.map((s, i) => (
        <section
          key={s.title}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-slate-900">
            {i + 1}. {s.title}
          </h2>
          <div className="prose prose-study prose-slate mt-3 max-w-none text-sm leading-relaxed text-slate-700">
            {s.body.split("\n\n").map((para, j) => (
              <p key={j} className="mb-3 last:mb-0 whitespace-pre-wrap">
                {para}
              </p>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
