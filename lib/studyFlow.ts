import type { StudyCondition, StudyPhase } from "@/types/study";

/** Next phase after completing the current step. */
export function getNextPhaseAfter(
  condition: StudyCondition,
  completed: StudyPhase
): StudyPhase | null {
  if (completed === "training") {
    if (condition === "control") return "genai";
    return "eval1";
  }
  if (completed === "eval1") {
    if (condition === "two_eval") return "genai";
    if (condition === "four_eval") return "eval2";
    return "genai";
  }
  if (completed === "eval2") return "genai";
  if (completed === "genai") return "essay";
  if (completed === "essay") return "complete";
  return null;
}

export function phaseLabel(phase: StudyPhase): string {
  switch (phase) {
    case "training":
      return "Training";
    case "eval1":
      return "Evaluation task 1";
    case "eval2":
      return "Evaluation task 2";
    case "genai":
      return "GenAI interaction";
    case "essay":
      return "Essay submission";
    case "complete":
      return "Complete";
    default:
      return phase;
  }
}
