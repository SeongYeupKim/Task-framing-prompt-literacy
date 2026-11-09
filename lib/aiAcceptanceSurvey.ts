/**
 * Pre-study GenAI acceptance (Likert 1–5). Item order is fixed for analysis.
 * Pilot sessions used a different 20-item list; those arrays stay length 20.
 */
export const AI_ACCEPTANCE_ITEMS: readonly string[] = [
  "GenAI enhances my ability to organize and synthesize information from different sources.",
  "GenAI assists me in understanding difficult concepts more easily.",
  "GenAI is useful for checking my understanding of course materials.",
  "GenAI improves the quality of my learning outcomes.",
  "GenAI provides useful feedback that supports my academic progress.",
  "GenAI helps me summarize ideas and structure course concepts more effectively.",
  "GenAI is useful for brainstorming and developing new ideas.",
  "GenAI is useful for generating or refining my academic work (e.g., essays).",
  "Using GenAI tools in my learning helps me complete tasks more efficiently.",
  "I can critically interact with GenAI tools considering they can generate misinformation.",
  "I can effectively use GenAI for learning without assistance from others.",
  "I can recognize how the GenAI arrives at its suggestions or explanations.",
  "I know how to re-question and re-ask GenAI if their responses do not align with my purpose.",
  "I feel confident using GenAI to support my studies.",
] as const;

/** Length of the retired pilot acceptance scale. */
export const LEGACY_AI_ACCEPTANCE_COUNT = 20;

/** 5-point scale labels (1 = lowest agreement with statement as written, adjust wording per convention) */
export const LIKERT_SCALE = [
  { value: 1, label: "Strongly disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Agree" },
  { value: 5, label: "Strongly agree" },
] as const;
