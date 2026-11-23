import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/cookies";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { error: { code: "UNAUTHENTICATED", message: "No active session." } },
      { status: 401 },
    );
  }

  return NextResponse.json({ data: session });
}
