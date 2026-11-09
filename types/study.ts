/**
 * Assigned at registration (equal random): control, instruction, instruction_se.
 * `instruction_eval` is the retired pilot arm (also stored as four_eval). two_eval maps to instruction.
 */
export type StudyCondition =
  | "control"
  | "instruction"
  | "instruction_se"
  | "instruction_eval";

/** Linear progress through the study UI. */
export type StudyPhase =
  | "study_consent"
  | "study_overview"
  | "ai_acceptance"
  | "training"
  | "task_intro_eval"
  | "eval1"
  | "task_intro_final"
  | "genai"
  | "essay"
  | "demographics"
  | "submission_guide"
  | "complete";

export type EvalCaseId = "studentA" | "studentB" | "studentC";

export interface EvaluationRatings {
  studentA: number | null;
  studentB: number | null;
  studentC: number | null;
}

export interface EvaluationRationales {
  studentA: string;
  studentB: string;
  studentC: string;
}

export interface EvaluationTaskSubmission {
  taskKey: "eval1" | "eval2";
  ratings: EvaluationRatings;
  rationales: EvaluationRationales;
  submittedAt: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  /**
   * Follow-up prompts only. First moment the student typed or pasted the next
   * prompt after the preceding AI response was shown.
   */
  inputStartedAt?: string;
  /** Seconds from that AI response until `inputStartedAt`. */
  secAfterAiToInput?: number;
  /** Seconds from that AI response until this prompt was sent. */
  secAfterAiToSend?: number;
}

export type CourseInstructorChoice =
  | "cristin_hall"
  | "rayne_sperling"
  | "other";

export interface DemographicsSubmission {
  psuEmail: string;
  ageYears: string;
  gender: string[];
  raceEthnicity: string[];
  nameForCredit: string;
  followUpInterview: boolean;
  /** Item 7: course instructor (preset or other with specify). */
  courseInstructor: CourseInstructorChoice;
  /** Free text when `courseInstructor === "other"`; otherwise empty. */
  courseInstructorOther: string;
  submittedAt: string;
}

/** Written answers for the instruction + self-explanation arm. */
export interface CareSelfExplanationAnswers {
  definition: string;
  distinction: string;
  judgment: string;
  advice: string;
  /** Older item 2 randomized two follow-ups. Current item 2 does not. */
  distinctionOrder?: "extend_first" | "repair_first";
}

export interface UserStudyDoc {
  email?: string;
  condition: StudyCondition | string;
  phase: StudyPhase;
  /** Informed consent completed on /study (first screen after sign-in). */
  studyConsentCompletedAt?: string;
  /** Participation guidance page completed; next is AI acceptance. */
  studyOverviewCompletedAt?: string;
  /** Pre-study Likert (1–5). Current scale is 14 items; pilot rows may still hold 20. */
  aiAcceptanceResponses?: number[];
  aiAcceptanceCompletedAt?: string;
  /** First paint of the CARE reading; set when TrainingPanel mounts. */
  trainingStartedAt?: string;
  /** First time the self-explanation questions open (`instruction_se` only). */
  instructionStartedAt?: string;
  trainingCompletedAt?: string;
  /** Pilot instruction arm: free response before the matching task. */
  instructionSelfExplanation?: string;
  instructionMatchingByDimension?: Record<string, string>;
  instructionMatchingExampleDisplayOrder?: string[];
  /** CARE self-explanation arm. */
  careSeDefinition?: string;
  careSeDistinction?: string;
  careSeJudgment?: string;
  careSeAdvice?: string;
  careSeDistinctionOrder?: "extend_first" | "repair_first";
  instructionCompletedAt?: string;
  /** First entry into the GenAI + essay block (after final task intro). */
  finalTaskStartedAt?: string;
  /** First time the participant opens the essay editor (after chat phase). */
  essayEditorOpenedAt?: string;
  eval1?: EvaluationTaskSubmission;
  eval2?: EvaluationTaskSubmission;
  genaiMessages?: ChatMessage[];
  essayText?: string;
  essaySubmittedAt?: string;
  demographics?: DemographicsSubmission;
  demographicsSubmittedAt?: string;
  /** First time the Canvas record PDF was downloaded. */
  recordPdfDownloadedAt?: string;
  studyCompletedAt?: string;
  /** Set when participant confirms password and restarts from study_consent. */
  studyRestartedAt?: string;
  updatedAt?: string;
  createdAt?: string;
}
