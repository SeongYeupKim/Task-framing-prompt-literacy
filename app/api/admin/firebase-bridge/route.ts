import { NextResponse } from "next/server";
import { validateAdminCredentials } from "@/lib/adminDashboardAuth";
import { resolveBridgeFirebaseEmail } from "@/lib/adminFirebaseBridge";

export const dynamic = "force-dynamic";

/**
 * Returns the Firebase email to use with the dashboard password.
 * Defaults: ADMIN_EXPORT_FIREBASE_EMAIL, else full @psu.edu username, else username@psu.edu.
 */
export async function POST(req: Request) {
  let body: { username?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const u = String(body.username ?? "");
  const p = String(body.password ?? "");
  if (!validateAdminCredentials(u, p)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const firebaseEmail = resolveBridgeFirebaseEmail(u);
  if (!firebaseEmail) {
    return NextResponse.json(
      {
        error:
          "Could not resolve a @psu.edu Firebase email. Set ADMIN_EXPORT_FIREBASE_EMAIL or use a @psu.edu dashboard username.",
        code: "NO_BRIDGE_EMAIL",
      },
      { status: 404 },
    );
  }

  return NextResponse.json({ firebaseEmail });
}
