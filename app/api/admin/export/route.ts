import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import {
  deepSerializeFirestore,
  getAdminFirestore,
} from "@/lib/firebaseAdmin";
import {
  getAdminExportSecret,
  getFirebaseCredentialEnvPresence,
} from "@/lib/serverEnv";

const COLLECTION = "users";

function safeCompareSecret(a: string, b: string): boolean {
  try {
    const x = Buffer.from(a, "utf8");
    const y = Buffer.from(b, "utf8");
    if (x.length !== y.length) return false;
    return timingSafeEqual(x, y);
  } catch {
    return false;
  }
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: Request) {
  const expected = getAdminExportSecret();
  if (!expected) {
    return NextResponse.json(
      {
        error:
          "Server is not configured for exports (missing admin export password env var).",
        hint:
          "Vercel → Settings → Environment Variables: name must be ADMIN_EXPORT_SECRET (or ADIM_EXPORT_SECRET), value non-empty, Production checked, then Redeploy. If it still fails, remove the variable and add it again so a new deployment picks it up.",
        vercelEnv: process.env.VERCEL_ENV ?? null,
      },
      { status: 503 },
    );
  }

  let body: { secret?: string };
  try {
    body = (await req.json()) as { secret?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const secret = typeof body.secret === "string" ? body.secret : "";
  if (!safeCompareSecret(secret, expected)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const db = getAdminFirestore();
    const snap = await db.collection(COLLECTION).get();

    const participants = snap.docs.map((d) => {
      const raw = d.data();
      const serialized = deepSerializeFirestore(raw) as Record<string, unknown>;
      return {
        ...serialized,
        uid: d.id,
      };
    });

    const projectId =
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() || null;

    return NextResponse.json({
      exportedAt: new Date().toISOString(),
      projectId,
      participantCount: participants.length,
      participants,
    });
  } catch (e) {
    console.error("admin export:", e);
    const message =
      e instanceof Error
        ? e.message
        : "Export failed. Check FIREBASE_SERVICE_ACCOUNT_JSON and permissions.";
    const isFirebaseConfig =
      message.includes("Firebase Admin") ||
      message.includes("FIREBASE_SERVICE_ACCOUNT") ||
      message.includes("FIREBASE_ADMIN");
    return NextResponse.json(
      {
        error: message,
        vercelEnv: process.env.VERCEL_ENV ?? null,
        ...(isFirebaseConfig
          ? { credentialEnv: getFirebaseCredentialEnvPresence() }
          : {}),
      },
      { status: 500 },
    );
  }
}
