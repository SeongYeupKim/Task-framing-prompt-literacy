/**
 * After a participant finishes the study in this browser tab/session, we mark
 * it so they see “Thank you” immediately. After they log out, the marker is
 * cleared so a return visit can offer a supervised restart (with password).
 */
export const STUDY_COMPLETE_IN_SESSION_KEY =
  "psu_task_framing_study_complete_ack_v1";

export function markStudyCompletedInThisBrowserSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STUDY_COMPLETE_IN_SESSION_KEY, "1");
}

export function clearStudySessionMarkers(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STUDY_COMPLETE_IN_SESSION_KEY);
}

export function hasStudyCompleteSessionAck(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(STUDY_COMPLETE_IN_SESSION_KEY) === "1";
}
