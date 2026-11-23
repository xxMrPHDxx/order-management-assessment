import "server-only";

import { assertAuthenticated, assertRole } from "./authorization";
import { getSession } from "./cookies";
import type { Role, Session } from "./session";

export async function requireSession(): Promise<Session> {
  return assertAuthenticated(await getSession());
}

export async function requireRole<R extends Role>(role: R): Promise<Extract<Session, { role: R }>> {
  return assertRole(await getSession(), role);
}
