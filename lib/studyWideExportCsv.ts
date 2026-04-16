/**
 * One wide CSV row per participant: superset schema (instruction_eval / condition2),
 * blank cells where control / instruction arms did not have that field.
 * Column order: email, condition, responses…, essay, st_1/ai_1/…, demographics.
 */

import { AI_ACCEPTANCE_ITEMS } from "@/lib/aiAcceptanceSurvey";
import { normalizeCondition } from "@/lib/studyConditions";

export type WideExportParticipant = Record<string, unknown> & { uid: string };

const INSTR_DIM_KEYS = [
  "goal",
  "content",
  "task_conditions",
  "audience",
  "format",
  "success",
] as const;

const AI_ACCEPT_N = AI_ACCEPTANCE_ITEMS.length;

function csvCell(value: string): string {
  if (value === "") return "";
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function str(v: unknown): string {
  if (v === undefined || v === null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  try {
    return JSON.stringify(v);
  } catch {
    return "";
  }
}

/** Whole seconds between ISO timestamps; empty if missing or invalid. */
function durationSecondsIso(isoStart: unknown, isoEnd: unknown): string {
  if (typeof isoStart !== "string" || typeof isoEnd !== "string") return "";
  const a = Date.parse(isoStart);
  const b = Date.parse(isoEnd);
  if (!Number.isFinite(a) || !Number.isFinite(b) || b < a) return "";
  return String(Math.round((b - a) / 1000));
}

function genaiUserAssistantLists(messages: unknown): {
  user: string[];
  assistant: string[];
} {
  const user: string[] = [];
  const assistant: string[] = [];
  if (!Array.isArray(messages)) return { user, assistant };
  for (const m of messages) {
    if (!m || typeof m !== "object") continue;
    const role = (m as { role?: string }).role;
    const content = (m as { content?: unknown }).content;
    const text = content == null ? "" : String(content);
    if (role === "user") user.push(text);
    else if (role === "assistant") assistant.push(text);
  }
  return { user, assistant };
}

function maxChatDepth(participants: WideExportParticipant[]): number {
  let max = 0;
  for (const p of participants) {
    const { user, assistant } = genaiUserAssistantLists(p.genaiMessages);
    max = Math.max(max, user.length, assistant.length);
  }
  return max;
}

function likertColumns(p: WideExportParticipant): string[] {
  const raw = p.aiAcceptanceResponses;
  const out: string[] = [];
  for (let i = 0; i < AI_ACCEPT_N; i++) {
    if (!Array.isArray(raw) || raw[i] === undefined || raw[i] === null) {
      out.push("");
    } else {
      out.push(str(raw[i]));
    }
  }
  return out;
}

function eval1Flat(p: WideExportParticipant): {
  ratings: [string, string, string];
  rationales: [string, string, string];
  submittedAt: string;
} {
  const e = p.eval1;
  if (!e || typeof e !== "object") {
    return { ratings: ["", "", ""], rationales: ["", "", ""], submittedAt: "" };
  }
  const ratings = (e as { ratings?: Record<string, unknown> }).ratings ?? {};
  const rationales = (e as { rationales?: Record<string, unknown> }).rationales ??
    {};
  const r = (k: string) =>
    ratings[k] === undefined || ratings[k] === null ? "" : str(ratings[k]);
  const t = (k: string) => (typeof rationales[k] === "string" ? rationales[k] : str(rationales[k]));
  return {
    ratings: [r("studentA"), r("studentB"), r("studentC")],
    rationales: [t("studentA"), t("studentB"), t("studentC")],
    submittedAt: str((e as { submittedAt?: unknown }).submittedAt),
  };
}

function instrMatchingDim(
  p: WideExportParticipant,
  key: string,
): string {
  const raw = p.instructionMatchingByDimension;
  if (!raw || typeof raw !== "object") return "";
  const v = (raw as Record<string, unknown>)[key];
  return v == null ? "" : String(v);
}

function demographicsFlat(p: WideExportParticipant): {
  psuEmail: string;
  ageYears: string;
  gender: string;
  raceEthnicity: string;
  nameForCredit: string;
  followUpInterview: string;
  submittedAt: string;
} {
  const d = p.demographics;
  if (!d || typeof d !== "object") {
    return {
      psuEmail: "",
      ageYears: "",
      gender: "",
      raceEthnicity: "",
      nameForCredit: "",
      followUpInterview: "",
      submittedAt: "",
    };
  }
  const g = (d as { gender?: unknown }).gender;
  const gender = Array.isArray(g) ? g.map((x) => String(x)).join("|") : str(g);
  const re = (d as { raceEthnicity?: unknown }).raceEthnicity;
  const raceEthnicity = Array.isArray(re)
    ? re.map((x) => String(x)).join("|")
    : str(re);
  const fu = (d as { followUpInterview?: unknown }).followUpInterview;
  return {
    psuEmail: str((d as { psuEmail?: unknown }).psuEmail),
    ageYears: str((d as { ageYears?: unknown }).ageYears),
    gender,
    raceEthnicity,
    nameForCredit: str((d as { nameForCredit?: unknown }).nameForCredit),
    followUpInterview:
      fu === true ? "true" : fu === false ? "false" : "",
    submittedAt: str((d as { submittedAt?: unknown }).submittedAt),
  };
}

/** Fixed header list (excluding dynamic st_i / ai_i). */
export function studyWideExportStaticHeaders(): string[] {
  const likert = Array.from(
    { length: AI_ACCEPT_N },
    (_, i) => `ai_accept_${String(i + 1).padStart(2, "0")}`,
  );
  const instrMatch = INSTR_DIM_KEYS.map((k) => `instr_match_${k}`);
  return [
    "student_email",
    "condition",
    "firebase_uid",
    "phase",
    "createdAt",
    "updatedAt",
    "studyRestartedAt",
    "studyConsentCompletedAt",
    "studyOverviewCompletedAt",
    "aiAcceptanceCompletedAt",
    ...likert,
    "trainingStartedAt",
    "trainingCompletedAt",
    "instructionStartedAt",
    "instructionCompletedAt",
    "training_total_seconds",
    "instruction_part1_seconds",
    "instruction_part2_seconds",
    "instruction_self_explanation",
    ...instrMatch,
    "instruction_matching_display_order_json",
    "eval1_rating_studentA",
    "eval1_rating_studentB",
    "eval1_rating_studentC",
    "eval1_rationale_studentA",
    "eval1_rationale_studentB",
    "eval1_rationale_studentC",
    "eval1_submittedAt",
    "finalTaskStartedAt",
    "essayEditorOpenedAt",
    "essaySubmittedAt",
    "final_task_total_seconds",
    "final_task_genai_seconds",
    "final_task_essay_seconds",
    "essay_text",
  ];
}

export function studyWideExportChatHeaders(depth: number): string[] {
  const h: string[] = [];
  for (let i = 1; i <= depth; i++) {
    h.push(`st_${i}`, `ai_${i}`);
  }
  return h;
}

export function studyWideExportDemographicsHeaders(): string[] {
  return [
    "demographics_psuEmail",
    "demographics_ageYears",
    "demographics_gender",
    "demographics_raceEthnicity",
    "demographics_nameForCredit",
    "demographics_followUpInterview",
    "demographics_submittedAt",
  ];
}

export function buildStudyWideExportCsv(
  participants: WideExportParticipant[],
): string {
  const depth = maxChatDepth(participants);
  const staticH = studyWideExportStaticHeaders();
  const chatH = studyWideExportChatHeaders(depth);
  const demoH = studyWideExportDemographicsHeaders();
  const header = [...staticH, ...chatH, ...demoH];

  const rows: string[][] = [];

  for (const p of participants) {
    const cond = normalizeCondition(str(p.condition));
    const ev = eval1Flat(p);
    const demo = demographicsFlat(p);
    const { user, assistant } = genaiUserAssistantLists(p.genaiMessages);

    const displayOrder =
      p.instructionMatchingExampleDisplayOrder === undefined ||
      p.instructionMatchingExampleDisplayOrder === null
        ? ""
        : str(p.instructionMatchingExampleDisplayOrder);

    const trainingTotalSec = durationSecondsIso(
      p.trainingStartedAt,
      p.trainingCompletedAt,
    );
    const instructionPart1Sec = durationSecondsIso(
      p.trainingStartedAt,
      p.instructionStartedAt,
    );
    const instructionPart2Sec = durationSecondsIso(
      p.instructionStartedAt,
      p.instructionCompletedAt,
    );
    const finalTaskTotalSec = durationSecondsIso(
      p.finalTaskStartedAt,
      p.essaySubmittedAt,
    );
    const finalTaskGenaiSec = durationSecondsIso(
      p.finalTaskStartedAt,
      p.essayEditorOpenedAt,
    );
    const finalTaskEssaySec = durationSecondsIso(
      p.essayEditorOpenedAt,
      p.essaySubmittedAt,
    );

    const cells: string[] = [
      csvCell(str(p.email)),
      csvCell(cond),
      csvCell(str(p.uid)),
      csvCell(str(p.phase)),
      csvCell(str(p.createdAt)),
      csvCell(str(p.updatedAt)),
      csvCell(str(p.studyRestartedAt)),
      csvCell(str(p.studyConsentCompletedAt)),
      csvCell(str(p.studyOverviewCompletedAt)),
      csvCell(str(p.aiAcceptanceCompletedAt)),
      ...likertColumns(p).map(csvCell),
      csvCell(str(p.trainingStartedAt)),
      csvCell(str(p.trainingCompletedAt)),
      csvCell(str(p.instructionStartedAt)),
      csvCell(str(p.instructionCompletedAt)),
      csvCell(trainingTotalSec),
      csvCell(instructionPart1Sec),
      csvCell(instructionPart2Sec),
      csvCell(str(p.instructionSelfExplanation)),
      ...INSTR_DIM_KEYS.map((k) => csvCell(instrMatchingDim(p, k))),
      csvCell(displayOrder),
      ...ev.ratings.map(csvCell),
      ...ev.rationales.map(csvCell),
      csvCell(ev.submittedAt),
      csvCell(str(p.finalTaskStartedAt)),
      csvCell(str(p.essayEditorOpenedAt)),
      csvCell(str(p.essaySubmittedAt)),
      csvCell(finalTaskTotalSec),
      csvCell(finalTaskGenaiSec),
      csvCell(finalTaskEssaySec),
      csvCell(str(p.essayText)),
    ];

    for (let i = 0; i < depth; i++) {
      cells.push(csvCell(user[i] ?? ""));
      cells.push(csvCell(assistant[i] ?? ""));
    }

    cells.push(
      csvCell(demo.psuEmail),
      csvCell(demo.ageYears),
      csvCell(demo.gender),
      csvCell(demo.raceEthnicity),
      csvCell(demo.nameForCredit),
      csvCell(demo.followUpInterview),
      csvCell(demo.submittedAt),
    );

    rows.push(cells);
  }

  return [header.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
}
