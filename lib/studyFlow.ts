import type { StudyCondition, StudyPhase } from "@/types/study";

/** Next phase after completing the current step. */
export function getNextPhaseAfter(
  condition: StudyCondition,
  completed: StudyPhase
): StudyPhase | null {
  if (completed === "study_consent") {
    return "study_overview";
  }
  if (completed === "study_overview") {
    return "ai_acceptance";
  }
  if (completed === "ai_acceptance") {
    if (condition === "control" || condition === "instruction_eval") {
      return "task_intro_final";
    }
    return "training";
  }
  if (completed === "training") return "task_intro_final";
  if (completed === "task_intro_final") return "genai";
  if (completed === "genai") return "essay";
  if (completed === "essay") return "demographics";
  if (completed === "demographics") return "submission_guide";
  if (completed === "submission_guide") return "complete";
  return null;
}

/** Short label for the header (student-friendly). */
export function phaseLabel(phase: StudyPhase): string {
  switch (phase) {
    case "study_consent":
      return "Informed consent";
    case "study_overview":
      return "Your session overview";
    case "ai_acceptance":
      return "AI acceptance";
    case "training":
      return "Instruction";
    case "task_intro_eval":
      return "Before the main task";
    case "eval1":
      return "Before the main task";
    case "task_intro_final":
      return "Before the main task";
    case "genai":
      return "Chat with the AI";
    case "essay":
      return "Write your essay";
    case "demographics":
      return "Demographics";
    case "submission_guide":
      return "Submission record";
    case "complete":
      return "You’re done";
    default:
      return phase;
  }
}
