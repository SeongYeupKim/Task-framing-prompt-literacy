import { NextResponse } from "next/server";
import { validateAdminCredentials } from "@/lib/adminDashboardAuth";

export async function POST(req: Request) {
  let body: { username?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const ok = validateAdminCredentials(
    String(body.username ?? ""),
    String(body.password ?? ""),
  );
  if (!ok) {
    return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
