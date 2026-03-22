import type { StudyCondition, StudyPhase } from "@/types/study";

/** Phases each participant actually sees (order matters). */
const FLOW: Record<StudyCondition, StudyPhase[]> = {
  control: ["ai_acceptance", "training", "genai", "essay", "demographics", "complete"],
  two_eval: [
    "ai_acceptance",
    "training",
    "eval1",
    "genai",
    "essay",
    "demographics",
    "complete",
  ],
  four_eval: [
    "ai_acceptance",
    "training",
    "eval1",
    "eval2",
    "genai",
    "essay",
    "demographics",
    "complete",
  ],
};

export function getPhaseProgress(
  condition: StudyCondition,
  phase: StudyPhase
): { step: number; total: number } {
  const list = FLOW[condition];
  const idx = list.indexOf(phase);
  if (idx < 0) return { step: 1, total: list.length };
  return { step: idx + 1, total: list.length };
}
