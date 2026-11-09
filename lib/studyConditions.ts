import type { StudyCondition, StudyPhase } from "@/types/study";

/** Map legacy Firestore values. `instruction_eval` stays distinct from the new self-explanation arm. */
export function normalizeCondition(raw: string | undefined): StudyCondition {
  if (raw === "two_eval" || raw === "instruction") return "instruction";
  if (raw === "four_eval" || raw === "instruction_eval") return "instruction_eval";
  if (raw === "instruction_se") return "instruction_se";
  if (raw === "control") return "control";
  return "control";
}

export function isLegacyEvalCondition(raw: string | undefined): boolean {
  return raw === "instruction_eval" || raw === "four_eval";
}

/** Third arm: same CARE reading, then four written questions. */
export function needsSelfExplanation(c: StudyCondition): boolean {
  return c === "instruction_se";
}

export function seesCareInstruction(c: StudyCondition): boolean {
  return c === "instruction" || c === "instruction_se";
}

/** Collapsible CARE reminder on the main chat and essay. */
export function showInstructionRecap(
  c: StudyCondition,
  phase: StudyPhase
): boolean {
  if (!seesCareInstruction(c)) return false;
  return phase === "genai" || phase === "essay";
}

/** Phase after AI acceptance survey completes. */
export function phaseAfterAiAcceptance(c: StudyCondition): StudyPhase {
  if (c === "control" || c === "instruction_eval") return "task_intro_final";
  return "training";
}
