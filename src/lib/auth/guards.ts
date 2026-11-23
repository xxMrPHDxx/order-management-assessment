import "server-only";

import { assertAuthenticated, assertRole } from "./authorization";
import { getSession } from "./cookies";
import type { Role, Session } from "./session";

export async function requireSession(): Promise<Session> {
  return assertAuthenticated(await getSession());
}

export async function requireRole(role: Role): Promise<Session> {
  return assertRole(await getSession(), role);
}
