import type { StudyCondition } from "@/types/study";

/** Opening text shown to every participant (condition-specific steps follow). */
export const PARTICIPATION_OVERVIEW_SHARED = {
  headline: "What this study is about",
  purpose: [
    "We are interested in understanding how students use AI for writing and related academic tasks. This will help us identify ways to support responsible, effective use of AI in academic work.",
  ],
  assignment:
    "You have been randomly assigned to one of several study groups. The list below describes the activities for your group so you can see what will happen and judge the time and effort involved.",
  time:
    "Most people finish everything in about 30 minutes. You can pause as needed, but please complete the study in one sitting when possible.",
} as const;

const CONSENT_STEP =
  "Informed consent (you completed this before creating an account or signing in).";

function stepsControl(): string[] {
  return [
    CONSENT_STEP,
    "A short questionnaire on your acceptance of AI tools.",
    "A brief orientation to the main writing task for your scenario.",
    "An interactive session where you use an AI chat tool with a study scenario and task instructions.",
    "A short writing task that builds on that work.",
    "A final demographics questionnaire.",
  ];
}

function stepsInstruction(): string[] {
  return [
    CONSENT_STEP,
    "A short questionnaire on your acceptance of AI tools.",
    "Instruction on task framing and features of effective AI prompts (reading material and a short practice activity).",
    "A brief orientation, then an interactive session where you use an AI chat tool with a study scenario.",
    "A short writing task.",
    "A final demographics questionnaire.",
  ];
}

function stepsInstructionEval(): string[] {
  return [
    CONSENT_STEP,
    "A short questionnaire on your acceptance of AI tools.",
    "Instruction on task framing and effective prompting (reading and a short matching practice).",
    "A practice activity where you read a scenario and rate example prompts for how well they frame the task.",
    "A brief orientation, then an interactive session where you use an AI chat tool with a study scenario.",
    "A short writing task.",
    "A final demographics questionnaire.",
  ];
}

/** Ordered steps after this overview page, tailored by experimental condition. */
export function participationOverviewSteps(
  condition: StudyCondition,
): string[] {
  switch (condition) {
    case "control":
      return stepsControl();
    case "instruction":
      return stepsInstruction();
    case "instruction_eval":
      return stepsInstructionEval();
    default:
      return stepsControl();
  }
}
