import { describe, expect, it } from "vitest";

import { loginSchema } from "@/lib/auth/login";

describe("login schema", () => {
  it("accepts a supplier login without a customer id", () => {
    const result = loginSchema.safeParse({ role: "supplier" });
    expect(result.success).toBe(true);
  });

  it("accepts a customer login with a uuid customer id", () => {
    const result = loginSchema.safeParse({
      role: "customer",
      customerId: "11111111-1111-4111-8111-111111111111",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a customer login without a customer id", () => {
    const result = loginSchema.safeParse({ role: "customer" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["customerId"]);
    }
  });

  it("rejects an unknown role", () => {
    expect(loginSchema.safeParse({ role: "admin" }).success).toBe(false);
  });

  it("rejects a non-uuid customer id", () => {
    expect(loginSchema.safeParse({ role: "customer", customerId: "acme" }).success).toBe(false);
  });
});
