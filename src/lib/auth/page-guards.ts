import "server-only";

import { redirect } from "next/navigation";

import { getSession } from "./cookies";
import type { Role, Session } from "./session";

/**
 * Page-level guard for server components. Redirects instead of throwing so a
 * browser navigation never renders an error boundary.
 */
export async function requirePageRole(role: Role): Promise<Session> {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }
  if (session.role !== role) {
    redirect(role === "customer" ? "/supplier/orders" : "/customer/orders");
  }

  return session;
}
