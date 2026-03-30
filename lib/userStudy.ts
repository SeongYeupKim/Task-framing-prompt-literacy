import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import type { User } from "firebase/auth";
import { getClientDb } from "@/lib/firebase";
import {
  normalizeCondition,
  phaseAfterAiAcceptance,
} from "@/lib/studyConditions";
import type {
  ChatMessage,
  DemographicsSubmission,
  EvaluationTaskSubmission,
  InstructionPracticeData,
  StudyCondition,
  StudyPhase,
  UserStudyDoc,
} from "@/types/study";

const COLLECTION = "users";

export async function getUserStudyDoc(uid: string): Promise<UserStudyDoc | null> {
  const db = getClientDb();
  const ref = doc(db, COLLECTION, uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as UserStudyDoc;
}

function randomCondition(): StudyCondition {
  const r = Math.floor(Math.random() * 3);
  if (r === 0) return "control";
  if (r === 1) return "instruction";
  return "instruction_eval";
}

export async function ensureUserStudyDoc(user: User): Promise<{
  condition: StudyCondition;
  phase: StudyPhase;
}> {
  const db = getClientDb();
  const ref = doc(db, COLLECTION, user.uid);
  const snap = await getDoc(ref);
  const now = new Date().toISOString();

  if (!snap.exists()) {
    const condition = randomCondition();
    await setDoc(ref, {
      email: user.email ?? "",
      condition,
      phase: "ai_acceptance" as StudyPhase,
      createdAt: now,
      updatedAt: now,
    });
    return { condition, phase: "ai_acceptance" };
  }

  const data = snap.data() as UserStudyDoc;
  const condition = normalizeCondition(String(data.condition ?? "control"));
  let phase = (data.phase ?? "ai_acceptance") as StudyPhase;

  /** Control participants should never stay on legacy “training” after consent. */
  if (
    condition === "control" &&
    phase === "training" &&
    data.aiAcceptanceCompletedAt
  ) {
    phase = "task_intro_final";
    await updateDoc(ref, {
      phase,
      updatedAt: new Date().toISOString(),
    });
  }

  /** Drop removed second evaluation phase for redesign. */
  if (String(phase) === "eval2") {
    phase = "task_intro_final";
    await updateDoc(ref, {
      phase,
      updatedAt: new Date().toISOString(),
    });
  }

  return { condition, phase };
}

export async function updateUserPhase(uid: string, phase: StudyPhase) {
  const db = getClientDb();
  const ref = doc(db, COLLECTION, uid);
  await updateDoc(ref, {
    phase,
    updatedAt: new Date().toISOString(),
  });
}

export async function saveAiAcceptance(uid: string, responses: number[]) {
  const db = getClientDb();
  const ref = doc(db, COLLECTION, uid);
  const snap = await getDoc(ref);
  const raw = snap.data() as { condition?: string } | undefined;
  const cond = normalizeCondition(raw?.condition);
  const next = phaseAfterAiAcceptance(cond);
  await updateDoc(ref, {
    aiAcceptanceResponses: responses,
    aiAcceptanceCompletedAt: new Date().toISOString(),
    phase: next,
    updatedAt: new Date().toISOString(),
  });
}

export async function saveInstructionCompletion(
  uid: string,
  practice: InstructionPracticeData,
  nextPhase: StudyPhase
) {
  const db = getClientDb();
  const ref = doc(db, COLLECTION, uid);
  const now = new Date().toISOString();
  await updateDoc(ref, {
    instructionSelfExplanation: practice.selfExplanation,
    instructionMatchingByDimension: practice.matchingByDimension,
    ...(practice.matchingExampleDisplayOrder !== undefined
      ? {
          instructionMatchingExampleDisplayOrder:
            practice.matchingExampleDisplayOrder,
        }
      : {}),
    instructionCompletedAt: now,
    trainingCompletedAt: now,
    phase: nextPhase,
    updatedAt: now,
  });
}

export async function markTrainingComplete(uid: string) {
  const db = getClientDb();
  const ref = doc(db, COLLECTION, uid);
  await updateDoc(ref, {
    trainingCompletedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

export async function saveEvaluationSubmission(
  uid: string,
  submission: EvaluationTaskSubmission
) {
  const db = getClientDb();
  const ref = doc(db, COLLECTION, uid);
  const field = submission.taskKey === "eval1" ? "eval1" : "eval2";
  await updateDoc(ref, {
    [field]: submission,
    updatedAt: new Date().toISOString(),
  });
}

export async function saveGenaiMessages(uid: string, messages: ChatMessage[]) {
  const db = getClientDb();
  const ref = doc(db, COLLECTION, uid);
  await updateDoc(ref, {
    genaiMessages: messages,
    updatedAt: new Date().toISOString(),
  });
}

export async function saveEssay(
  uid: string,
  essayText: string,
  genaiMessages: ChatMessage[]
) {
  const db = getClientDb();
  const ref = doc(db, COLLECTION, uid);
  await updateDoc(ref, {
    essayText,
    genaiMessages,
    essaySubmittedAt: new Date().toISOString(),
    phase: "demographics",
    updatedAt: new Date().toISOString(),
  });
}

export async function saveDemographics(
  uid: string,
  data: DemographicsSubmission
) {
  const db = getClientDb();
  const ref = doc(db, COLLECTION, uid);
  await updateDoc(ref, {
    demographics: data,
    demographicsSubmittedAt: data.submittedAt,
    phase: "complete",
    updatedAt: new Date().toISOString(),
  });
}