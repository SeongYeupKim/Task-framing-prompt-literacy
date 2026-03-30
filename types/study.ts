/** Assigned at registration / first session (equal random). Legacy: two_eval, four_eval. */
export type StudyCondition = "control" | "instruction" | "instruction_eval";

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
}

export interface DemographicsSubmission {
  psuEmail: string;
  ageYears: string;
  gender: string[];
  raceEthnicity: string[];
  nameForCredit: string;
  followUpInterview: boolean;
  submittedAt: string;
}

/** Saved when participant finishes instruction (both practice parts). */
export interface InstructionPracticeData {
  selfExplanation: string;
  /** Maps dimension key (e.g. goal) to chosen matching example id (e.g. mx3). */
  matchingByDimension: Record<string, string>;
  /** Example ids in display order (Example 1 = top …); for analysis / replication. */
  matchingExampleDisplayOrder?: string[];
}

export interface UserStudyDoc {
  email?: string;
  condition: StudyCondition | string;
  phase: StudyPhase;
  /** Informed consent completed on /study (first screen after sign-in). */
  studyConsentCompletedAt?: string;
  /** Participation guidance page completed; next is AI acceptance. */
  studyOverviewCompletedAt?: string;
  /** Pre-study Likert (1–5), one value per AI acceptance item in order. */
  aiAcceptanceResponses?: number[];
  aiAcceptanceCompletedAt?: string;
  trainingCompletedAt?: string;
  instructionSelfExplanation?: string;
  instructionMatchingByDimension?: Record<string, string>;
  instructionMatchingExampleDisplayOrder?: string[];
  instructionCompletedAt?: string;
  eval1?: EvaluationTaskSubmission;
  eval2?: EvaluationTaskSubmission;
  genaiMessages?: ChatMessage[];
  essayText?: string;
  essaySubmittedAt?: string;
  demographics?: DemographicsSubmission;
  demographicsSubmittedAt?: string;
  /** Set when participant confirms password and restarts from study_consent. */
  studyRestartedAt?: string;
  updatedAt?: string;
  createdAt?: string;
}
