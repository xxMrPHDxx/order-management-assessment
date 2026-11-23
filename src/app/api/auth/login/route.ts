import { NextResponse } from "next/server";

import { invalidJsonResponse, validationErrorResponse } from "@/lib/api/errors";
import { establishSession } from "@/lib/auth/cookies";
import { loginSchema } from "@/lib/auth/login";
import { createMockSession } from "@/lib/auth/service";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return invalidJsonResponse();
  }

  const parsed = loginSchema.safeParse(payload);
  if (!parsed.success) {
    return validationErrorResponse("Invalid login payload.", parsed.error);
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
