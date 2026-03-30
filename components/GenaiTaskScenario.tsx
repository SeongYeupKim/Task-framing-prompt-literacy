import { GENAI_TASK } from "@/lib/studyContent";

/** Scenario copy for the GenAI + essay task (same text as eval practice). */
export function GenaiTaskScenario() {
  return (
    <div className="space-y-3 text-sm font-medium leading-relaxed text-student-ink">
      {GENAI_TASK.scenarioParagraphs.map((para, i) => (
        <p key={i} className="indent-8">
          {para}
        </p>
      ))}
    </div>
  );
}
