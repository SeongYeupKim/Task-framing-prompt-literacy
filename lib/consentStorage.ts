/** Client-only: informed consent must be recorded before auth routes. */

export const CONSENT_STORAGE_KEY = "psu_task_framing_prompt_literacy_consent_v1";

export function readConsentAccepted(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(CONSENT_STORAGE_KEY) === "accepted";
}

export function writeConsentAccepted(): void {
  window.localStorage.setItem(CONSENT_STORAGE_KEY, "accepted");
}
