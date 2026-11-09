import { GENAI_TASK } from "@/lib/studyContent";

/** Scenario copy for the GenAI + essay task. */
export function GenaiTaskScenario() {
  return (
    <div className="space-y-1.5 text-sm leading-5 text-student-ink">
      {GENAI_TASK.scenarioParagraphs.map((para, i) => (
        <p key={i}>{para}</p>
      ))}
    </div>
  );
}
