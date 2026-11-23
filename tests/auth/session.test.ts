import { SignJWT } from "jose";
import { describe, expect, it } from "vitest";

import { signSession, verifySession, type Session } from "@/lib/auth/session";

const secret = "test-session-secret-that-is-at-least-32-chars";

const customerSession: Session = {
  role: "customer",
  customerId: "11111111-1111-4111-8111-111111111111",
  name: "Acme Logistics Ltd",
};

const supplierSession: Session = { role: "supplier", name: "Sam Patel" };

describe("session tokens", () => {
  it("round-trips a customer session", async () => {
    const token = await signSession(customerSession, secret);
    await expect(verifySession(token, secret)).resolves.toEqual(customerSession);
  });

  it("round-trips a supplier session", async () => {
    const token = await signSession(supplierSession, secret);
    await expect(verifySession(token, secret)).resolves.toEqual(supplierSession);
  });

  it("rejects a tampered token", async () => {
    const token = await signSession(customerSession, secret);
    const tampered = `${token.slice(0, -2)}xx`;
    await expect(verifySession(tampered, secret)).resolves.toBeNull();
  });

  it("rejects a token signed with another secret", async () => {
    const token = await signSession(customerSession, secret);
    await expect(verifySession(token, `${secret}-different`)).resolves.toBeNull();
  });

  it("rejects an expired token", async () => {
    const token = await signSession(customerSession, secret, {
      expiresIn: Math.floor(Date.now() / 1000) - 60,
    });
    await expect(verifySession(token, secret)).resolves.toBeNull();
  });

  it("rejects a valid signature with an unexpected payload", async () => {
    const token = await new SignJWT({ role: "admin", name: "Mallory" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode(secret));

    await expect(verifySession(token, secret)).resolves.toBeNull();
  });

  it("rejects a customer session without a customerId", async () => {
    const token = await new SignJWT({ role: "customer", name: "No Account" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode(secret));

    await expect(verifySession(token, secret)).resolves.toBeNull();
  });
});
