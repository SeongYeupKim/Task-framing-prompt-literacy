"use client";

import { useEffect, useState, useCallback } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { getClientAuth } from "@/lib/firebase";
import {
  ensureUserStudyDoc,
  getUserStudyDoc,
  markTrainingComplete,
  saveEvaluationSubmission,
  saveEssay,
  saveGenaiMessages,
  updateUserPhase,
} from "@/lib/userStudy";
import { getNextPhaseAfter, phaseLabel } from "@/lib/studyFlow";
import { EVAL1_SCENARIO, EVAL2_SCENARIO, GENAI_TASK } from "@/lib/studyContent";
import { TrainingPanel } from "@/components/TrainingPanel";
import { EvaluationTaskView } from "@/components/EvaluationTaskView";
import { GenAIInteractionPanel } from "@/components/GenAIInteractionPanel";
import { EssaySubmissionPanel } from "@/components/EssaySubmissionPanel";
import type {
  ChatMessage,
  EvaluationTaskSubmission,
  StudyCondition,
  StudyPhase,
} from "@/types/study";

export default function StudyPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [uid, setUid] = useState<string | null>(null);
  const [condition, setCondition] = useState<StudyCondition | null>(null);
  const [phase, setPhase] = useState<StudyPhase | null>(null);
  const [genaiMessages, setGenaiMessages] = useState<ChatMessage[]>([]);
  const [essayDraft, setEssayDraft] = useState("");

  useEffect(() => {
    const auth = getClientAuth();
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }
      setUid(user.uid);
      const info = await ensureUserStudyDoc(user);
      setCondition(info.condition);
      setPhase(info.phase);
      const doc = await getUserStudyDoc(user.uid);
      if (doc?.genaiMessages?.length) {
        setGenaiMessages(doc.genaiMessages);
      }
      if (doc?.essayText) {
        setEssayDraft(doc.essayText);
      }
      setReady(true);
    });
  }, [router]);

  async function handleLogout() {
    await signOut(getClientAuth());
    router.replace("/");
  }

  async function handleTrainingDone() {
    if (!uid || !condition) return;
    const next = getNextPhaseAfter(condition, "training");
    if (!next) return;
    await markTrainingComplete(uid);
    await updateUserPhase(uid, next);
    setPhase(next);
  }

  async function handleEvalSubmit(sub: EvaluationTaskSubmission) {
    if (!uid || !condition) return;
    await saveEvaluationSubmission(uid, sub);
    const completed: StudyPhase = sub.taskKey === "eval1" ? "eval1" : "eval2";
    const next = getNextPhaseAfter(condition, completed);
    if (!next) return;
    await updateUserPhase(uid, next);
    setPhase(next);
  }

  const persistMessages = useCallback(
    async (messages: ChatMessage[]) => {
      setGenaiMessages(messages);
      if (uid) await saveGenaiMessages(uid, messages);
    },
    [uid]
  );

  async function handleContinueToEssay() {
    if (!uid) return;
    await updateUserPhase(uid, "essay");
    setPhase("essay");
  }

  async function handleEssaySubmit(text: string) {
    if (!uid) return;
    await saveEssay(uid, text);
    setPhase("complete");
  }

  if (!ready || !uid || !condition || !phase) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-600">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <p className="text-sm font-medium text-slate-800">
            {phaseLabel(phase)}
          </p>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {phase === "training" && (
          <div className="space-y-6">
            <TrainingPanel />
            <button
              type="button"
              onClick={() => void handleTrainingDone()}
              className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
            >
              I have finished reading — continue
            </button>
          </div>
        )}

        {phase === "eval1" && (
          <EvaluationTaskView
            taskKey="eval1"
            title={EVAL1_SCENARIO.title}
            scenario={EVAL1_SCENARIO.scenario}
            taskConditions={[...EVAL1_SCENARIO.taskConditions]}
            cases={EVAL1_SCENARIO.cases}
            onSubmit={handleEvalSubmit}
          />
        )}

        {phase === "eval2" && (
          <EvaluationTaskView
            taskKey="eval2"
            title={EVAL2_SCENARIO.title}
            scenario={EVAL2_SCENARIO.scenario}
            taskConditions={[...EVAL2_SCENARIO.taskConditions]}
            cases={EVAL2_SCENARIO.cases}
            onSubmit={handleEvalSubmit}
          />
        )}

        {phase === "genai" && (
          <div className="grid gap-8 lg:grid-cols-2">
            <GenAIInteractionPanel
              messages={genaiMessages}
              onMessagesChange={persistMessages}
              onContinueToEssay={handleContinueToEssay}
            />
            <aside className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-base font-semibold text-slate-900">
                  Your task
                </h2>
                <p className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">
                  {GENAI_TASK.scenario}
                </p>
                <h3 className="mt-4 text-sm font-semibold text-slate-900">
                  Your explanation should satisfy:
                </h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                  {GENAI_TASK.taskConditions.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
              <p className="text-xs text-slate-500">
                Interactions are saved automatically. When you are ready, write
                your essay on the next screen.
              </p>
            </aside>
          </div>
        )}

        {phase === "essay" && (
          <EssaySubmissionPanel
            initialText={essayDraft}
            onSubmit={handleEssaySubmit}
          />
        )}

        {phase === "complete" && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center">
            <h1 className="text-xl font-semibold text-green-900">
              Thank you
            </h1>
            <p className="mt-2 text-sm text-green-800">
              Your responses have been recorded. You may close this window or log
              out.
            </p>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="mt-6 rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
            >
              Log out
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
