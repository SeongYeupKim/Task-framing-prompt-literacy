import { NextResponse } from "next/server";
import { validateAdminCredentials } from "@/lib/adminDashboardAuth";
import { adminFirestore } from "@/lib/firebaseAdmin";
import { serializeAdminDoc } from "@/lib/firestoreSerializeAdmin";
import { buildStudyWideExportCsv } from "@/lib/studyWideExportCsv";

export async function POST(req: Request) {
  let body: { username?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (
    !validateAdminCredentials(
      String(body.username ?? ""),
      String(body.password ?? ""),
    )
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const snap = await adminFirestore().collection("users").get();
    const participants = snap.docs.map((d) => ({
      uid: d.id,
      ...serializeAdminDoc(d.data()),
    }));
    const csv = buildStudyWideExportCsv(participants);
    const filename = `task-framing-study-wide-${new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, 19)}.csv`;
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Export failed";
    const status = msg.includes("Firebase Admin") ? 503 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
