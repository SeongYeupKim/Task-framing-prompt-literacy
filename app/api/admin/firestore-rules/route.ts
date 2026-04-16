import { readFileSync } from "fs";
import path from "path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Latest firestore.rules from the deployed app (for copy-paste into Firebase Console). */
export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "firestore.rules");
    const text = readFileSync(filePath, "utf8");
    return new NextResponse(text, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new NextResponse("Could not read firestore.rules on server.", {
      status: 500,
    });
  }
}
