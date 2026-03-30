import type { StudyCondition, StudyPhase } from "@/types/study";

/** Map legacy Firestore values to current condition labels. */
export function normalizeCondition(raw: string | undefined): StudyCondition {
  if (raw === "two_eval" || raw === "instruction") return "instruction";
  if (raw === "four_eval" || raw === "instruction_eval") return "instruction_eval";
  if (raw === "control") return "control";
  return (raw as StudyCondition) || "control";
}

export function needsEvalPractice(c: StudyCondition): boolean {
  return c === "instruction_eval";
}

/** Collapsible instruction recap: only for conditions that saw instruction. */
export function showInstructionRecap(
  c: StudyCondition,
  phase: StudyPhase
): boolean {
  if (c === "control") return false;
  if (c === "instruction") return phase === "genai" || phase === "essay";
  if (c === "instruction_eval") {
    return phase === "eval1" || phase === "genai" || phase === "essay";
  }
  return false;
}

/** Phase after AI acceptance survey completes. */
export function phaseAfterAiAcceptance(c: StudyCondition): StudyPhase {
  if (c === "control") return "task_intro_final";
  return "training";
}
