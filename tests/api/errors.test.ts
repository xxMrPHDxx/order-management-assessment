import { z } from "zod";
import { describe, expect, it, vi } from "vitest";

import { handleApiError, jsonError, validationErrorResponse } from "@/lib/api/errors";
import { AuthError } from "@/lib/auth/authorization";
import { OrderError } from "@/lib/orders/errors";

async function body(response: Response) {
  return (await response.json()) as {
    error: { code: string; message: string; details?: Array<{ path: string; message: string }> };
  };
}

describe("API error envelope", () => {
  it("returns code, message, and optional details", async () => {
    const response = jsonError(400, "BAD_INPUT", "Nope", [
      { path: "items.0.quantity", message: "Too small" },
    ]);
    expect(response.status).toBe(400);
    expect(await body(response)).toEqual({
      error: {
        code: "BAD_INPUT",
        message: "Nope",
        details: [{ path: "items.0.quantity", message: "Too small" }],
      },
    });
  });

  it("formats Zod issues with field paths", async () => {
    const parsed = z
      .object({ shippingAddress: z.string().min(10), items: z.array(z.string()).min(1) })
      .safeParse({ shippingAddress: "short", items: [] });
    expect(parsed.success).toBe(false);
    if (parsed.success) return;

    const response = validationErrorResponse("Invalid payload.", parsed.error);
    expect(response.status).toBe(400);
    const payload = await body(response);
    expect(payload.error.code).toBe("VALIDATION_ERROR");
    expect(payload.error.details?.map((detail) => detail.path)).toEqual([
      "shippingAddress",
      "items",
    ]);
  });

  it("maps AuthError and OrderError to their statuses", async () => {
    const unauthorized = handleApiError(new AuthError(401, "UNAUTHENTICATED", "Sign in."));
    expect(unauthorized.status).toBe(401);
    expect((await body(unauthorized)).error.code).toBe("UNAUTHENTICATED");

    const conflict = handleApiError(new OrderError(409, "ILLEGAL_TRANSITION", "No skipping."));
    expect(conflict.status).toBe(409);
    expect((await body(conflict)).error.code).toBe("ILLEGAL_TRANSITION");
  });

  it("hides unexpected error details from clients", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const response = handleApiError(new Error("database password leaked here"));
    expect(response.status).toBe(500);
    const payload = await body(response);
    expect(payload.error.code).toBe("INTERNAL_ERROR");
    expect(payload.error.message).not.toContain("password");
    spy.mockRestore();
  });
});
