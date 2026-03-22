/** Pre-study AI acceptance (Likert 1–5). Order is fixed for analysis. */
export const AI_ACCEPTANCE_ITEMS: readonly string[] = [
  "I plan to integrate AI into my academic work regularly.",
  "I feel comfortable engaging in dialogue with the AI during learning.",
  "If I have the opportunity, I intend to choose learning environments that use AI.",
  "I would encourage others to use AI tools for academic purposes.",
  "I am likely to use AI tools for both individual and collaborative learning.",
  "Using AI makes my learning experience feel more engaging and dynamic.",
  "I enjoy using AI for learning activities.",
  "I feel positive about using AI when it is part of my learning experience.",
  "I intend to use AI for learning in the future.",
  "I can critically interact with AI tools without needing extensive training.",
  "I can effectively use AI for learning without assistance from others.",
  "AI tools require little effort to integrate into my learning process.",
  "I can easily guide or redirect the AI when needed.",
  "I can recognize how the AI arrives at its suggestions or explanations.",
  "AI assists me in understanding difficult concepts more easily.",
  "AI enhances my ability to organize and synthesize information from different sources.",
  "Using AI tools in my learning helps me complete tasks more efficiently.",
  "AI improves the quality of my learning outcomes.",
  "AI provides useful feedback that supports my academic progress.",
  "AI helps me generate ideas and structure my writing more effectively.",
] as const;

/** 5-point scale labels (1 = lowest agreement with statement as written, adjust wording per convention) */
export const LIKERT_SCALE = [
  { value: 1, label: "Strongly disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Agree" },
  { value: 5, label: "Strongly agree" },
] as const;
