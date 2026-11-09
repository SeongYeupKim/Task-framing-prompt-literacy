"use client";

import { useEffect, useState, useCallback } from "react";
import {
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signOut,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { getClientAuth } from "@/lib/firebase";
import {
  ensureUserStudyDoc,
  completeStudyConsent,
  completeStudyOverview,
  getUserStudyDoc,
  saveEssay,
  saveGenaiMessages,
  saveAiAcceptance,
  saveDemographics,
  saveInstructionCompletion,
  recordRecordPdfDownloaded,
  completeSubmissionGuide,
  resetStudyFromBeginning,
  updateUserPhase,
  recordFinalTaskStarted,
  recordEssayEditorOpened,
} from "@/lib/userStudy";
import {
  clearStudySessionMarkers,
  markStudyCompletedInThisBrowserSession,
  hasStudyCompleteSessionAck,
} from "@/lib/studySessionMarkers";
import { getNextPhaseAfter, phaseLabel } from "@/lib/studyFlow";
import { getPhaseProgress } from "@/lib/studyProgress";
import {
  normalizeCondition,
  phaseAfterAiAcceptance,
  seesCareInstruction,
  showInstructionRecap,
} from "@/lib/studyConditions";
import { GENAI_TASK } from "@/lib/studyContent";
import { AiAcceptanceSurvey } from "@/components/AiAcceptanceSurvey";
import { DemographicsSurvey } from "@/components/DemographicsSurvey";
import { TrainingPanel } from "@/components/TrainingPanel";
import { GenAIInteractionPanel } from "@/components/GenAIInteractionPanel";
import { GenaiTaskScenario } from "@/components/GenaiTaskScenario";
import { EssaySubmissionPanel } from "@/components/EssaySubmissionPanel";
import { InstructionRecapCollapsible } from "@/components/InstructionRecapCollapsible";
import { TaskIntroPanel } from "@/components/TaskIntroPanel";
import { SubmissionGuide } from "@/components/SubmissionGuide";
import { InformedConsentScreen } from "@/components/InformedConsentScreen";
import { StudyParticipationOverview } from "@/components/StudyParticipationOverview";
import { StudyRestartGate } from "@/components/StudyRestartGate";
import { stripMarkdownForChat } from "@/lib/chatPlainText";
import type {
  CareSelfExplanationAnswers,
  ChatMessage,
  DemographicsSubmission,
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
  const [pdfDownloaded, setPdfDownloaded] = useState(false);
  const [aiAcceptanceDone, setAiAcceptanceDone] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [postCompleteUI, setPostCompleteUI] = useState<
    "pending" | "gate" | "thanks"
  >("pending");

  useEffect(() => {
    const auth = getClientAuth();
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }
      setUid(user.uid);
      setUserEmail(user.email ?? "");
      const info = await ensureUserStudyDoc(user);
      const doc = await getUserStudyDoc(user.uid);
      const cond = normalizeCondition(
        String(doc?.condition ?? info.condition ?? "control")
      );
      setCondition(cond);
      setPhase(info.phase);
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
      setPdfDownloaded(!!doc?.recordPdfDownloadedAt);
      setAiAcceptanceDone(!!doc?.aiAcceptanceCompletedAt);
      setReady(true);
    });
  }, [router]);

  useEffect(() => {
    if (!ready || phase !== "complete") {
      setPostCompleteUI("pending");
      return;
    }
    setPostCompleteUI(
      hasStudyCompleteSessionAck() ? "thanks" : "gate"
    );
  }, [ready, phase]);

  async function handleLogout() {
    clearStudySessionMarkers();
    await signOut(getClientAuth());
    router.replace("/");
  }

  async function handleRestartWithPassword(password: string) {
    const auth = getClientAuth();
    const user = auth.currentUser;
    if (!user?.email || !uid) {
      throw new Error("Not signed in.");
    }
    const cred = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, cred);
    const nextCondition = await resetStudyFromBeginning(uid);
    clearStudySessionMarkers();
    setCondition(nextCondition);
    setGenaiMessages([]);
    setEssayDraft("");
    setPdfDownloaded(false);
    setAiAcceptanceDone(false);
    setPhase("study_consent");
  }

  async function handleStudyConsentContinue() {
    if (!uid) return;
    await completeStudyConsent(uid);
    setPhase("study_overview");
  }

  async function handleStudyOverviewContinue() {
    if (!uid) return;
    await completeStudyOverview(uid);
    setPhase("ai_acceptance");
  }

  async function handleAiAcceptanceSubmit(responses: number[]) {
    if (!uid || !condition) return;
    await saveAiAcceptance(uid, responses);
    setAiAcceptanceDone(true);
    setPhase(phaseAfterAiAcceptance(condition));
  }

  async function handleInstructionComplete(
    answers: CareSelfExplanationAnswers | null
  ) {
    if (!uid || !condition) return;
    const next = getNextPhaseAfter(condition, "training");
    if (!next) return;
    await saveInstructionCompletion(uid, answers, next);
    setPhase(next);
  }

  async function handleTaskIntroFinalContinue() {
    if (!uid) return;
    await recordFinalTaskStarted(uid);
    await updateUserPhase(uid, "genai");
    setPhase("genai");
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
    await recordEssayEditorOpened(uid);
    await updateUserPhase(uid, "essay");
    setPhase("essay");
  }

  async function handleEssaySubmit(text: string) {
    if (!uid) return;
    await saveEssay(uid, text, genaiMessages);
    setEssayDraft(text);
    setPhase("demographics");
  }

  async function handleDemographicsSubmit(data: DemographicsSubmission) {
    if (!uid) return;
    await saveDemographics(uid, data);
    setPhase("submission_guide");
  }

  useEffect(() => {
    if (!ready || !phase) return;
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [phase, ready, aiAcceptanceDone]);

  if (!ready || !uid || !condition || !phase) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-student-canvas px-6 text-student-muted">
        <div className="h-8 w-8 animate-pulse rounded-full bg-navy-200" />
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

  const recapFinal = showInstructionRecap(condition, phase);

  const wideMain = phase === "training";
  const workspace = phase === "genai" || phase === "essay";

  return (
    <div
      className={
        workspace
          ? "flex h-dvh flex-col overflow-hidden bg-student-canvas"
          : "min-h-screen bg-student-canvas pb-8"
      }
    >
      <header
        className={`z-10 border-b border-student-border bg-white ${
          workspace ? "shrink-0" : "sticky top-0"
        }`}
      >
        <div
          className={`mx-auto max-w-[1600px] ${
            workspace ? "px-3 py-2" : "px-4 py-3"
          }`}
        >
          <div
            className={`w-full overflow-hidden rounded-full bg-student-border ${
              workspace ? "mb-1.5 h-1" : "mb-2 h-1.5"
            }`}
          >
            <div
              className="h-full rounded-full bg-navy-800 transition-all duration-500"
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
              className="shrink-0 rounded-md border border-student-border bg-white px-3 py-2 text-sm text-student-muted transition hover:bg-student-canvas hover:text-student-ink"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main
        className={
          workspace
            ? "mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col overflow-hidden px-3 py-2"
            : `mx-auto px-3 pt-3 sm:px-4 ${
                wideMain ? "max-w-[1600px]" : "max-w-5xl"
              }`
        }
      >
        {phase === "study_consent" && (
          <InformedConsentScreen
            variant="study"
            onAccepted={() => void handleStudyConsentContinue()}
          />
        )}

        {phase === "study_overview" && (
          <StudyParticipationOverview
            condition={condition}
            onContinue={handleStudyOverviewContinue}
          />
        )}

        {showAiAcceptance && (
          <AiAcceptanceSurvey onSubmit={handleAiAcceptanceSubmit} />
        )}

        {!showAiAcceptance && phase === "training" && (
          <TrainingPanel
            condition={condition}
            studyUid={uid}
            onComplete={handleInstructionComplete}
          />
        )}

        {phase === "task_intro_final" && (
          <TaskIntroPanel
            variant={
              seesCareInstruction(condition)
                ? "final_instruction"
                : "final_control"
            }
            onContinue={handleTaskIntroFinalContinue}
          />
        )}

        {(phase === "genai" || phase === "essay") && (
          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
            {recapFinal && <InstructionRecapCollapsible />}

            <div className="grid max-h-[38%] shrink-0 gap-2 overflow-hidden lg:grid-cols-2">
              <article className="overflow-y-auto border border-student-border bg-white px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-navy-800">
                  Scenario
                </p>
                <h2 className="mt-0.5 text-sm font-semibold leading-snug text-student-ink">
                  {GENAI_TASK.title}
                </h2>
                <div className="mt-1">
                  <GenaiTaskScenario />
                </div>
              </article>
              <section className="overflow-y-auto border border-student-border bg-white px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-navy-800">
                  Task
                </p>
                <h2 className="mt-0.5 text-sm font-semibold leading-snug text-student-ink">
                  What the explanation should do
                </h2>
                <ol className="mt-1 space-y-1 text-sm leading-5 text-student-ink">
                  {GENAI_TASK.taskConditions.map((c, i) => (
                    <li key={c}>
                      <span className="font-semibold">{i + 1}. </span>
                      {c}
                    </li>
                  ))}
                </ol>
              </section>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-2 gap-2 overflow-hidden lg:grid-cols-2 lg:grid-rows-1">
              <div className="min-h-0 min-w-0">
                <GenAIInteractionPanel
                  messages={genaiMessages}
                  onMessagesChange={persistMessages}
                  className="h-full min-h-0"
                />
              </div>

              {phase === "genai" && (
                <div className="flex min-h-0 min-w-0 flex-col justify-center overflow-hidden rounded-md border-2 border-dashed border-navy-200 bg-navy-50 px-5 py-4 text-center shadow-student">
                  <p className="text-sm leading-6 text-student-ink">
                    When you’re ready to write, open the essay editor. The chat
                    stays on the left.
                  </p>
                  <button
                    type="button"
                    onClick={() => void handleContinueToEssay()}
                    className="mx-auto mt-3 rounded-md bg-navy-800 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-navy-900"
                  >
                    Open essay editor
                  </button>
                </div>
              )}

              {phase === "essay" && (
                <div className="min-h-0 min-w-0">
                  <EssaySubmissionPanel
                    embedded
                    initialText={essayDraft}
                    onSubmit={handleEssaySubmit}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {phase === "demographics" && (
          <DemographicsSurvey onSubmit={handleDemographicsSubmit} />
        )}

        {phase === "submission_guide" && (
          <SubmissionGuide
            email={userEmail}
            essay={essayDraft}
            messages={genaiMessages}
            alreadyDownloaded={pdfDownloaded}
            onDownloaded={async () => {
              await recordRecordPdfDownloaded(uid);
              setPdfDownloaded(true);
            }}
            onFinish={async () => {
              await completeSubmissionGuide(uid);
              markStudyCompletedInThisBrowserSession();
              setPhase("complete");
            }}
          />
        )}

        {phase === "complete" && postCompleteUI === "pending" && (
          <p className="text-center text-sm font-medium text-student-muted">
            Loading…
          </p>
        )}

        {phase === "complete" && postCompleteUI === "thanks" && (
          <div className="mx-auto max-w-lg rounded-md border border-navy-200 bg-navy-50 px-8 py-10 text-center shadow-student">
            <p className="text-3xl" aria-hidden>
              ✓
            </p>
            <h1 className="mt-3 text-2xl font-semibold text-student-ink">
              Thank you
            </h1>
            <p className="mt-3 text-sm font-medium leading-relaxed text-student-muted">
              Your responses are saved. Keep the PDF you downloaded and upload
              it to Canvas if you have not already.
            </p>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="mt-8 rounded-md bg-navy-800 px-6 py-3 text-sm font-semibold text-white hover:bg-navy-900"
            >
              Log out
            </button>
          </div>
        )}

        {phase === "complete" && postCompleteUI === "gate" && (
          <StudyRestartGate
            emailHint={userEmail}
            onKeepSubmission={() => {
              markStudyCompletedInThisBrowserSession();
              setPostCompleteUI("thanks");
            }}
            onRestartWithPassword={(pw) => handleRestartWithPassword(pw)}
          />
        )}
      </main>
    </div>
  );
}
