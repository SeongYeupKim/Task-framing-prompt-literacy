import { NextResponse } from "next/server";
import {
  adminAuthEnvConfigured,
  validateAdminCredentials,
} from "@/lib/adminDashboardAuth";

export async function POST(req: Request) {
  let body: { username?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (!adminAuthEnvConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Set ADMIN_DASHBOARD_USERNAME and ADMIN_DASHBOARD_PASSWORD on the server.",
      },
      { status: 503 },
    );
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
