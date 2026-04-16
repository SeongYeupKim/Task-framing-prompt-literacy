/**
 * Client- or server-safe helpers to turn export JSON into CSV / chat transcripts.
 */

export type AdminExportParticipant = Record<string, unknown> & { uid: string };

export type AdminExportPayload = {
  exportedAt: string;
  projectId: string | null;
  participantCount: number;
  participants: AdminExportParticipant[];
};

function csvCell(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function asJson(value: unknown): string {
  if (value === undefined || value === null) return "";
  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
}

/** One row per participant; nested objects and chat arrays stored as JSON strings. */
export function participantsToCsv(participants: AdminExportParticipant[]): string {
  const columns = [
    "uid",
    "email",
    "condition",
    "phase",
    "createdAt",
    "updatedAt",
    "studyConsentCompletedAt",
    "studyOverviewCompletedAt",
    "aiAcceptanceCompletedAt",
    "trainingStartedAt",
    "instructionStartedAt",
    "trainingCompletedAt",
    "instructionCompletedAt",
    "finalTaskStartedAt",
    "essayEditorOpenedAt",
    "essaySubmittedAt",
    "demographicsSubmittedAt",
    "studyRestartedAt",
    "instructionSelfExplanation",
    "essayText",
    "aiAcceptanceResponses",
    "instructionMatchingByDimension",
    "instructionMatchingExampleDisplayOrder",
    "eval1",
    "eval2",
    "genaiMessages",
    "demographics",
  ] as const;

  const header = columns.join(",");
  const rows = participants.map((p) =>
    columns
      .map((col) => {
        if (col === "uid") return csvCell(String(p.uid ?? ""));
        const v = p[col];
        if (
          col === "aiAcceptanceResponses" ||
          col === "instructionMatchingByDimension" ||
          col === "instructionMatchingExampleDisplayOrder" ||
          col === "eval1" ||
          col === "eval2" ||
          col === "genaiMessages" ||
          col === "demographics"
        ) {
          return csvCell(asJson(v));
        }
        if (typeof v === "string") return csvCell(v);
        if (v === undefined || v === null) return "";
        return csvCell(String(v));
      })
      .join(","),
  );

  return [header, ...rows].join("\r\n");
}

type ChatMsg = { role?: string; content?: string; createdAt?: string };

function formatChatLog(p: AdminExportParticipant): string {
  const lines: string[] = [];
  const email = typeof p.email === "string" ? p.email : "";
  lines.push(`=== ${p.uid}${email ? ` | ${email}` : ""} ===`);

  const raw = p.genaiMessages;
  if (!Array.isArray(raw) || raw.length === 0) {
    lines.push("(no chat messages stored)");
    lines.push("");
    return lines.join("\n");
  }

  for (const m of raw as ChatMsg[]) {
    const role = m.role === "assistant" ? "ASSISTANT" : "USER";
    const ts = m.createdAt ? String(m.createdAt) : "?";
    const content = m.content != null ? String(m.content) : "";
    lines.push(`[${ts}] ${role}:`);
    lines.push(content);
    lines.push("");
  }

  return lines.join("\n");
}

/** Plain-text file: all participants’ chat logs in sequence. */
export function participantsToChatTranscript(
  participants: AdminExportParticipant[],
): string {
  const blocks = participants.map(formatChatLog);
  return blocks.join("\n---\n\n");
}

export function downloadBlob(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
