import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { getClientDb } from "@/lib/firebase";
import type {
  ChatMessage,
  EvaluationTaskSubmission,
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
  if (r === 1) return "two_eval";
  return "four_eval";
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
      phase: "training" as StudyPhase,
      createdAt: now,
      updatedAt: now,
    });
    return { condition, phase: "training" };
  }

  const data = snap.data() as {
    condition?: StudyCondition;
    phase?: StudyPhase;
  };
  return {
    condition: data.condition ?? "control",
    phase: data.phase ?? "training",
  };
}

export async function updateUserPhase(uid: string, phase: StudyPhase) {
  const db = getClientDb();
  const ref = doc(db, COLLECTION, uid);
  await updateDoc(ref, {
    phase,
    updatedAt: new Date().toISOString(),
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

export async function saveEssay(uid: string, essayText: string) {
  const db = getClientDb();
  const ref = doc(db, COLLECTION, uid);
  await updateDoc(ref, {
    essayText,
    essaySubmittedAt: new Date().toISOString(),
    phase: "complete",
    updatedAt: new Date().toISOString(),
  });
}
