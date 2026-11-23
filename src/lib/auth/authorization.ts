import type { Role, Session } from "./session";

export type AuthErrorCode = "UNAUTHENTICATED" | "FORBIDDEN";

export class AuthError extends Error {
  readonly status: 401 | 403;
  readonly code: AuthErrorCode;

  constructor(status: 401 | 403, code: AuthErrorCode, message: string) {
    super(message);
    this.name = "AuthError";
    this.status = status;
    this.code = code;
  }
}

export function assertAuthenticated(session: Session | null): Session {
  if (!session) {
    throw new AuthError(401, "UNAUTHENTICATED", "Sign in to continue.");
  }
  return session;
}

export function assertRole(session: Session | null, role: Role): Session {
  const authenticated = assertAuthenticated(session);
  if (authenticated.role !== role) {
    throw new AuthError(403, "FORBIDDEN", `This action requires the ${role} role.`);
  }
  return authenticated;
}

export function assertCustomerOwnsOrder(session: Session, orderCustomerId: string): void {
  if (session.role === "customer" && session.customerId !== orderCustomerId) {
    throw new AuthError(403, "FORBIDDEN", "You can only access your own orders.");
  }
}
