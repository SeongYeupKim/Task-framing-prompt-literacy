import type { AdminExportParticipant } from "@/lib/adminExportFormat";

export type ExportSummary = {
  total: number;
  byPhase: Record<string, number>;
  withEssay: number;
  withChat: number;
  complete: number;
};

export function summarizeExport(
  participants: AdminExportParticipant[],
): ExportSummary {
  const byPhase: Record<string, number> = {};
  let withEssay = 0;
  let withChat = 0;
  let complete = 0;

  for (const p of participants) {
    const phase = typeof p.phase === "string" ? p.phase : "unknown";
    byPhase[phase] = (byPhase[phase] ?? 0) + 1;
    if (typeof p.essayText === "string" && p.essayText.trim().length > 0) {
      withEssay += 1;
    }
    if (Array.isArray(p.genaiMessages) && p.genaiMessages.length > 0) {
      withChat += 1;
    }
    if (p.phase === "complete") {
      complete += 1;
    }
  }

  return {
    total: participants.length,
    byPhase,
    withEssay,
    withChat,
    complete,
  };
}
