"use client";

import { INSTRUCTION_RECAP_BULLETS } from "@/lib/studyContent";

/** Brief reminder of CARE (collapsed by default). */
export function InstructionRecapCollapsible() {
  return (
    <details className="group rounded-md border border-navy-200 bg-navy-50 shadow-sm">
      <summary className="cursor-pointer list-none px-3 py-1.5 text-sm font-semibold text-navy-900">
        <span className="inline-flex items-center gap-2">
          <span className="text-navy-800 group-open:rotate-90 transition-transform">▸</span>
          Brief instruction reminder (CARE)
        </span>
      </summary>
      <div className="border-t border-navy-100 px-3 pb-2 pt-2 text-sm leading-5 text-student-ink">
        <ul className="grid gap-1 md:grid-cols-2">
          {INSTRUCTION_RECAP_BULLETS.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>
    </details>
  );
}
