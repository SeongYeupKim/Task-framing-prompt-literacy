import type { StudyCondition, StudyPhase } from "@/types/study";

/** Phases each participant actually sees (order matters). */
const FLOW: Record<StudyCondition, StudyPhase[]> = {
  control: [
    "study_overview",
    "ai_acceptance",
    "task_intro_final",
    "genai",
    "essay",
    "demographics",
    "complete",
  ],
  instruction: [
    "study_overview",
    "ai_acceptance",
    "training",
    "task_intro_final",
    "genai",
    "essay",
    "demographics",
    "complete",
  ],
  instruction_eval: [
    "study_overview",
    "ai_acceptance",
    "training",
    "task_intro_eval",
    "eval1",
    "task_intro_final",
    "genai",
    "essay",
    "demographics",
    "complete",
  ],
};

/** Legacy keys from Firestore before rename. */
const LEGACY_FLOW: Record<string, StudyPhase[]> = {
  two_eval: FLOW.instruction,
  four_eval: FLOW.instruction_eval,
};

export function getPhaseProgress(
  condition: StudyCondition | string,
  phase: StudyPhase
): { step: number; total: number } {
  const list =
    FLOW[condition as StudyCondition] ?? LEGACY_FLOW[condition as string];
  if (!list) return { step: 1, total: 8 };
  const idx = list.indexOf(phase);
  if (idx < 0) return { step: 1, total: list.length };
  return { step: idx + 1, total: list.length };
}
