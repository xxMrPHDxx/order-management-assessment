import { NextResponse } from "next/server";
import type { ZodError } from "zod";

import { AuthError } from "@/lib/auth/authorization";
import { OrderError } from "@/lib/orders/errors";

type ErrorDetails = Array<{ path: string; message: string }>;

export function jsonError(status: number, code: string, message: string, details?: ErrorDetails) {
  return NextResponse.json(
    { error: { code, message, ...(details && details.length > 0 ? { details } : {}) } },
    { status },
  );
}

export function validationErrorResponse(message: string, error: ZodError) {
  return jsonError(
    400,
    "VALIDATION_ERROR",
    message,
    error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    })),
  );
}

export function invalidJsonResponse() {
  return jsonError(400, "INVALID_JSON", "Request body must be valid JSON.");
}

export function handleApiError(error: unknown) {
  if (error instanceof AuthError) {
    return jsonError(error.status, error.code, error.message);
  }
  if (error instanceof OrderError) {
    return jsonError(error.status, error.code, error.message);
  }
  if (isZodError(error)) {
    return validationErrorResponse("Request validation failed.", error);
  }

  console.error("Unhandled API error", error);
  return jsonError(500, "INTERNAL_ERROR", "An unexpected error occurred.");
}

function isZodError(error: unknown): error is ZodError {
  return (
    typeof error === "object" &&
    error !== null &&
    "issues" in error &&
    Array.isArray((error as { issues?: unknown }).issues)
  );
}
