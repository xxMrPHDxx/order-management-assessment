import { NextResponse } from "next/server";

import { establishSession } from "@/lib/auth/cookies";
import { loginSchema } from "@/lib/auth/login";
import { createMockSession } from "@/lib/auth/service";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "INVALID_JSON", message: "Request body must be valid JSON." } },
      { status: 400 },
    );
  }

  const parsed = loginSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid login payload.",
          details: parsed.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
      },
      { status: 400 },
    );
  }

  const result = await createMockSession(parsed.data);
  if (!result.ok) {
    return NextResponse.json(
      { error: { code: "INVALID_CREDENTIALS", message: result.message } },
      { status: 400 },
    );
  }

  await establishSession(result.session);
  return NextResponse.json({ data: result.session });
}
