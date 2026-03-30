import type { StudyCondition, StudyPhase } from "@/types/study";
import { needsEvalPractice } from "@/lib/studyConditions";

/** Next phase after completing the current step. */
export function getNextPhaseAfter(
  condition: StudyCondition,
  completed: StudyPhase
): StudyPhase | null {
  if (completed === "study_overview") {
    return "ai_acceptance";
  }
  if (completed === "ai_acceptance") {
    if (condition === "control") return "task_intro_final";
    return "training";
  }
  if (completed === "training") {
    if (needsEvalPractice(condition)) return "task_intro_eval";
    return "task_intro_final";
  }
  if (completed === "task_intro_eval") return "eval1";
  if (completed === "eval1") return "task_intro_final";
  if (completed === "task_intro_final") return "genai";
  if (completed === "genai") return "essay";
  if (completed === "essay") return "demographics";
  if (completed === "demographics") return "complete";
  return null;
}

/** Short label for the header (student-friendly). */
export function phaseLabel(phase: StudyPhase): string {
  switch (phase) {
    case "study_overview":
      return "Before you begin";
    case "ai_acceptance":
      return "AI acceptance";
    case "training":
      return "Instruction (Part 1–2)";
    case "task_intro_eval":
      return "Before you practice: rating prompts";
    case "eval1":
      return "Rate example prompts";
    case "task_intro_final":
      return "Before the main task";
    case "genai":
      return "Chat with the AI";
    case "essay":
      return "Write your essay";
    case "demographics":
      return "Demographics";
    case "complete":
      return "You’re done";
    default:
      return phase;
  }
}
