import { NextResponse } from "next/server";

import { AuthError } from "@/lib/auth/authorization";
import { OrderError } from "@/lib/orders/errors";

type ErrorDetails = Array<{ path: string; message: string }>;

export function jsonError(status: number, code: string, message: string, details?: ErrorDetails) {
  return NextResponse.json(
    { error: { code, message, ...(details ? { details } : {}) } },
    { status },
  );
}

export function handleApiError(error: unknown) {
  if (error instanceof AuthError) {
    return jsonError(error.status, error.code, error.message);
  }
  if (error instanceof OrderError) {
    return jsonError(error.status, error.code, error.message);
  }

  console.error("Unhandled API error", error);
  return jsonError(500, "INTERNAL_ERROR", "An unexpected error occurred.");
}
