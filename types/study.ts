/** Assigned at registration / first session (equal random). */
export type StudyCondition = "control" | "two_eval" | "four_eval";

/** Linear progress through the study UI. */
export type StudyPhase =
  | "training"
  | "eval1"
  | "eval2"
  | "genai"
  | "essay"
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

export interface UserStudyDoc {
  email?: string;
  condition: StudyCondition;
  phase: StudyPhase;
  trainingCompletedAt?: string;
  eval1?: EvaluationTaskSubmission;
  eval2?: EvaluationTaskSubmission;
  genaiMessages?: ChatMessage[];
  essayText?: string;
  essaySubmittedAt?: string;
  updatedAt?: string;
  createdAt?: string;
}
