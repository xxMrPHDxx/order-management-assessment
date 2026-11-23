import { describe, expect, it } from "vitest";

import {
  assertAuthenticated,
  assertCustomerOwnsOrder,
  assertRole,
  AuthError,
} from "@/lib/auth/authorization";
import type { Session } from "@/lib/auth/session";

const customerSession: Session = {
  role: "customer",
  customerId: "11111111-1111-4111-8111-111111111111",
  name: "Acme Logistics Ltd",
};

const otherCustomerId = "22222222-2222-4222-8222-222222222222";

const supplierSession: Session = { role: "supplier", name: "Sam Patel" };

function expectAuthError(
  action: () => unknown,
  status: 401 | 403,
  code: "UNAUTHENTICATED" | "FORBIDDEN",
) {
  try {
    action();
  } catch (error) {
    expect(error).toBeInstanceOf(AuthError);
    expect((error as AuthError).status).toBe(status);
    expect((error as AuthError).code).toBe(code);
    return;
  }
  throw new Error("Expected an AuthError to be thrown");
}

describe("role checks", () => {
  it("rejects an anonymous request with 401", () => {
    expectAuthError(() => assertAuthenticated(null), 401, "UNAUTHENTICATED");
    expectAuthError(() => assertRole(null, "customer"), 401, "UNAUTHENTICATED");
  });

  it("allows a matching role", () => {
    expect(assertRole(customerSession, "customer")).toEqual(customerSession);
    expect(assertRole(supplierSession, "supplier")).toEqual(supplierSession);
  });

  it("rejects a customer attempting a supplier action with 403", () => {
    expectAuthError(() => assertRole(customerSession, "supplier"), 403, "FORBIDDEN");
  });

  it("rejects a supplier attempting a customer action with 403", () => {
    expectAuthError(() => assertRole(supplierSession, "customer"), 403, "FORBIDDEN");
  });
});

describe("order ownership", () => {
  it("allows a customer to access their own order", () => {
    expect(() =>
      assertCustomerOwnsOrder(customerSession, customerSession.customerId),
    ).not.toThrow();
  });

  it("rejects another customer's order with 403", () => {
    expectAuthError(
      () => assertCustomerOwnsOrder(customerSession, otherCustomerId),
      403,
      "FORBIDDEN",
    );
  });

  it("allows the supplier to access any order", () => {
    expect(() => assertCustomerOwnsOrder(supplierSession, otherCustomerId)).not.toThrow();
  });
});
