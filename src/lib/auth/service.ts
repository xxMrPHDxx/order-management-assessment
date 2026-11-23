import "server-only";

import { prisma } from "@/lib/db/prisma";

import type { LoginInput } from "./login";
import type { Session } from "./session";

const SUPPLIER_NAME = "Sam Patel";

export type MockLoginResult = { ok: true; session: Session } | { ok: false; message: string };

export async function createMockSession(input: LoginInput): Promise<MockLoginResult> {
  if (input.role === "supplier") {
    return { ok: true, session: { role: "supplier", name: SUPPLIER_NAME } };
  }

  if (!input.customerId) {
    return { ok: false, message: "Select a customer account." };
  }

  const customer = await prisma.customer.findUnique({
    where: { id: input.customerId },
    select: { id: true, name: true },
  });

  if (!customer) {
    return { ok: false, message: "That customer account does not exist." };
  }

  return {
    ok: true,
    session: { role: "customer", customerId: customer.id, name: customer.name },
  };
}
