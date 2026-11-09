import { GENAI_TASK } from "@/lib/studyContent";

/** Scenario copy for the GenAI + essay task. */
export function GenaiTaskScenario() {
  return (
    <div className="space-y-5 text-base leading-7 text-student-ink">
      {GENAI_TASK.scenarioParagraphs.map((para, i) => (
        <p key={i}>{para}</p>
      ))}
    </div>
  );
}
