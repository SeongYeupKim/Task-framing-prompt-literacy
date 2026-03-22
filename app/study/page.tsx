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
  saveAiAcceptance,
  updateUserPhase,
} from "@/lib/userStudy";
import { getNextPhaseAfter, phaseLabel } from "@/lib/studyFlow";
import { getPhaseProgress } from "@/lib/studyProgress";
import { EVAL1_SCENARIO, EVAL2_SCENARIO, GENAI_TASK } from "@/lib/studyContent";
import { AiAcceptanceSurvey } from "@/components/AiAcceptanceSurvey";
import { TrainingPanel } from "@/components/TrainingPanel";
import { EvaluationTaskView } from "@/components/EvaluationTaskView";
import { GenAIInteractionPanel } from "@/components/GenAIInteractionPanel";
import { EssaySubmissionPanel } from "@/components/EssaySubmissionPanel";
import { TaskConditionLine } from "@/components/TaskConditionLine";
import { stripMarkdownForChat } from "@/lib/chatPlainText";
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
  const [aiAcceptanceDone, setAiAcceptanceDone] = useState(false);

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
        setGenaiMessages(
          doc.genaiMessages.map((m) =>
            m.role === "assistant"
              ? { ...m, content: stripMarkdownForChat(m.content) }
              : m
          )
        );
      }
      if (doc?.essayText) {
        setEssayDraft(doc.essayText);
      }
      setAiAcceptanceDone(!!doc?.aiAcceptanceCompletedAt);
      setReady(true);
    });
  }, [router]);

  async function handleLogout() {
    await signOut(getClientAuth());
    router.replace("/");
  }

  async function handleAiAcceptanceSubmit(responses: number[]) {
    if (!uid) return;
    await saveAiAcceptance(uid, responses);
    setAiAcceptanceDone(true);
    setPhase("training");
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
    await saveEssay(uid, text, genaiMessages);
    setPhase("complete");
  }

  if (!ready || !uid || !condition || !phase) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-student-canvas px-6 text-student-muted">
        <div className="h-8 w-8 animate-pulse rounded-full bg-teal-200" />
        <p className="text-sm">Getting your session ready…</p>
      </div>
    );
  }

  const showAiAcceptance =
    !aiAcceptanceDone &&
    (phase === "ai_acceptance" || phase === "training");

  const effectivePhase: StudyPhase = showAiAcceptance
    ? "ai_acceptance"
    : phase!;

  const { step, total } = getPhaseProgress(condition, effectivePhase);

  return (
    <div className="min-h-screen bg-student-canvas pb-16">
      <header className="sticky top-0 z-10 border-b border-student-border bg-student-card/95 backdrop-blur-sm">
        <div className="mx-auto max-w-[1920px] px-4 py-4">
          <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-student-border">
            <div
              className="h-full rounded-full bg-teal-500 transition-all duration-500"
              style={{ width: `${(step / total) * 100}%` }}
            />
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-student-muted">
                Step {step} of {total}
              </p>
              <p className="mt-0.5 text-lg font-semibold text-student-ink">
                {phaseLabel(effectivePhase)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="shrink-0 rounded-xl border border-student-border bg-white px-3 py-2 text-sm text-student-muted transition hover:bg-student-canvas hover:text-student-ink"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main
        className={`mx-auto px-3 pt-8 sm:px-4 ${
          phase === "genai" || phase === "essay"
            ? "max-w-[1920px]"
            : "max-w-4xl"
        }`}
      >
        {showAiAcceptance && (
          <AiAcceptanceSurvey onSubmit={handleAiAcceptanceSubmit} />
        )}

        {!showAiAcceptance && phase === "training" && (
          <div className="space-y-8">
            <TrainingPanel isControl={condition === "control"} />
            <div className="flex justify-center pb-8">
              <button
                type="button"
                onClick={() => void handleTrainingDone()}
                className="rounded-2xl bg-teal-600 px-8 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-teal-700"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {phase === "eval1" && (
          <EvaluationTaskView
            taskKey="eval1"
            title={EVAL1_SCENARIO.title}
            scenario={[...EVAL1_SCENARIO.scenario]}
            taskConditions={[...EVAL1_SCENARIO.taskConditions]}
            cases={EVAL1_SCENARIO.cases}
            onSubmit={handleEvalSubmit}
          />
        )}

        {phase === "eval2" && (
          <EvaluationTaskView
            taskKey="eval2"
            title={EVAL2_SCENARIO.title}
            scenario={[...EVAL2_SCENARIO.scenario]}
            taskConditions={[...EVAL2_SCENARIO.taskConditions]}
            cases={EVAL2_SCENARIO.cases}
            onSubmit={handleEvalSubmit}
          />
        )}

        {(phase === "genai" || phase === "essay") && (
          <div
            className={`grid grid-cols-1 gap-6 xl:grid-cols-3 xl:grid-rows-1 xl:items-stretch xl:gap-5 xl:min-h-0 ${
              /* Same row height on large screens; each column scrolls inside */
              "xl:h-[calc(100vh-10rem)] xl:max-h-[calc(100vh-10rem)]"
            }`}
          >
            {/* Column 1: scenario + task conditions (scroll inside) */}
            <aside className="flex min-h-0 min-w-0 flex-col xl:h-full">
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-student-border bg-student-card shadow-student p-5 sm:p-6">
                <div className="shrink-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-student-muted">
                    Scenario
                  </p>
                  <h2 className="mt-1 text-lg font-semibold leading-snug text-student-ink">
                    {GENAI_TASK.title}
                  </h2>
                </div>
                <div className="mt-3 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
                  <p className="text-sm leading-relaxed text-student-ink">
                    {GENAI_TASK.scenario}
                  </p>
                  <h3 className="mt-5 text-xs font-semibold uppercase tracking-wide text-student-muted">
                    Task conditions
                  </h3>
                  <ul className="mt-2 space-y-3 text-student-ink">
                    {GENAI_TASK.taskConditions.map((c) => (
                      <li
                        key={c}
                        className="border-l-[3px] border-teal-500 pl-3 leading-relaxed"
                      >
                        <TaskConditionLine text={c} />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </aside>

            {/* Column 2: chat — fixed column height; messages scroll inside */}
            <div className="flex min-h-[min(52vh,560px)] min-w-0 flex-col xl:min-h-0 xl:h-full">
              <GenAIInteractionPanel
                messages={genaiMessages}
                onMessagesChange={persistMessages}
                className="h-full min-h-0 flex-1"
              />
            </div>

            {/* Column 3: essay prompt or essay form (same height; scroll inside) */}
            <aside className="flex min-h-0 min-w-0 flex-col xl:h-full">
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                {phase === "genai" && (
                  <div className="flex h-full min-h-[min(52vh,280px)] flex-col justify-center overflow-y-auto rounded-2xl border-2 border-dashed border-teal-300 bg-teal-50/50 p-6 text-center shadow-student xl:h-full xl:min-h-0">
                    <p className="text-sm leading-relaxed text-student-ink">
                      When you’re ready to write, open the essay panel. Your
                      chat stays in the middle column—scroll there anytime.
                    </p>
                    <button
                      type="button"
                      onClick={() => void handleContinueToEssay()}
                      className="mt-5 w-full rounded-2xl bg-teal-600 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-teal-700"
                    >
                      Open essay editor
                    </button>
                  </div>
                )}
                {phase === "essay" && (
                  <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
                    <EssaySubmissionPanel
                      embedded
                      initialText={essayDraft}
                      onSubmit={handleEssaySubmit}
                    />
                  </div>
                )}
              </div>
            </aside>
          </div>
        )}

        {phase === "complete" && (
          <div className="mx-auto max-w-lg rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 to-emerald-50 px-8 py-10 text-center shadow-student">
            <p className="text-3xl" aria-hidden>
              ✓
            </p>
            <h1 className="mt-3 text-2xl font-semibold text-student-ink">
              Thank you
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-student-muted">
              Your responses are saved. You can close this tab or log out.
            </p>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="mt-8 rounded-2xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-800"
            >
              Log out
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
