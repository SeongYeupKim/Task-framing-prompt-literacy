import type { StudyCondition, StudyPhase } from "@/types/study";

/** Next phase after completing the current step. */
export function getNextPhaseAfter(
  condition: StudyCondition,
  completed: StudyPhase
): StudyPhase | null {
  if (completed === "ai_acceptance") return "training";
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

/** Short label for the header (student-friendly). */
export function phaseLabel(phase: StudyPhase): string {
  switch (phase) {
    case "ai_acceptance":
      return "AI acceptance";
    case "training":
      return "Read the introduction";
    case "eval1":
      return "Rate example prompts (1)";
    case "eval2":
      return "Rate example prompts (2)";
    case "genai":
      return "Chat with the AI";
    case "essay":
      return "Write your essay";
    case "complete":
      return "You’re done";
    default:
      return phase;
  }
}
