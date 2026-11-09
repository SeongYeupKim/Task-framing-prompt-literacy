"use client";

import { INSTRUCTION_RECAP_BULLETS } from "@/lib/studyContent";

/** Brief reminder of CARE (collapsed by default). */
export function InstructionRecapCollapsible() {
  return (
    <details className="group rounded-md border border-navy-200 bg-navy-50 shadow-sm">
      <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-navy-900">
        <span className="inline-flex items-center gap-2">
          <span className="text-navy-800 group-open:rotate-90 transition-transform">▸</span>
          Brief instruction reminder (CARE)
        </span>
      </summary>
      <div className="border-t border-navy-100 px-5 pb-5 pt-4 text-base leading-7 text-student-ink">
        <p>
          Four moves for prompting and for what you do after the AI answers:
        </p>
        <ul className="mt-4 list-none space-y-4">
          {INSTRUCTION_RECAP_BULLETS.map((line) => (
            <li key={line} className="border-l-2 border-navy-700 pl-4">
              {line}
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}
