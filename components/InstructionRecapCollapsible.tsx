"use client";

import { INSTRUCTION_RECAP_BULLETS } from "@/lib/studyContent";

/** Brief reminder of the six dimensions (collapsed by default). */
export function InstructionRecapCollapsible() {
  return (
    <details className="group rounded-xl border border-teal-200 bg-teal-50/60 shadow-sm">
      <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-teal-900">
        <span className="inline-flex items-center gap-2">
          <span className="text-teal-600 group-open:rotate-90 transition-transform">▸</span>
          Brief instruction reminder (task framing dimensions)
        </span>
      </summary>
      <div className="border-t border-teal-100 px-4 pb-4 pt-2 text-sm leading-relaxed text-student-ink">
        <p className="text-student-muted">
          Click to review the six things a clear request to an AI makes explicit:
        </p>
        <ul className="mt-3 list-none space-y-2">
          {INSTRUCTION_RECAP_BULLETS.map((line) => (
            <li key={line} className="border-l-2 border-teal-400 pl-3">
              {line}
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}
