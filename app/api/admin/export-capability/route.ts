import { NextResponse } from "next/server";
import { isFirebaseAdminConfigured } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

/** Whether /api/admin/export-csv can run (Firebase Admin env configured). */
export async function GET() {
  return NextResponse.json({
    serverExportEnabled: isFirebaseAdminConfigured(),
  });
}
