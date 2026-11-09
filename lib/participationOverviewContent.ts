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

const SESSION_CONSENT_DONE =
  "Informed consent (you completed this on the previous screen).";

function stepsControl(): string[] {
  return [
    SESSION_CONSENT_DONE,
    "A short questionnaire on your acceptance of AI tools.",
    "A brief orientation to the main writing task for your scenario.",
    "An interactive session where you use an AI chat tool with a study scenario and task instructions.",
    "A short writing task that builds on that work.",
    "A final demographics questionnaire.",
    "A PDF of your essay and chat history, which you download and upload to Canvas.",
  ];
}

function stepsInstruction(): string[] {
  return [
    SESSION_CONSENT_DONE,
    "A short questionnaire on your acceptance of AI tools.",
    "A short reading on how to prompt and interact with AI.",
    "A brief orientation, then an interactive session where you use an AI chat tool with a study scenario.",
    "A short writing task.",
    "A final demographics questionnaire.",
    "A PDF of your essay and chat history, which you download and upload to Canvas.",
  ];
}

function stepsInstructionSe(): string[] {
  return [
    SESSION_CONSENT_DONE,
    "A short questionnaire on your acceptance of AI tools.",
    "The same short reading, followed by four written questions. You will explain the ideas in your own words, judge a short example chat, and advise that student on how to improve the interaction.",
    "A brief orientation, then an interactive session where you use an AI chat tool with a study scenario.",
    "A short writing task.",
    "A final demographics questionnaire.",
    "A PDF of your essay and chat history, which you download and upload to Canvas.",
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
    case "instruction_se":
      return stepsInstructionSe();
    case "instruction_eval":
      return stepsControl();
    default:
      return stepsControl();
  }
}
