import "server-only";

import { cookies } from "next/headers";

import { env } from "@/lib/env";

import {
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
  signSession,
  verifySession,
  type Session,
} from "./session";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_TTL_SECONDS,
} as const;

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }
  return verifySession(token, env.SESSION_SECRET);
}

export async function establishSession(session: Session): Promise<void> {
  const token = await signSession(session, env.SESSION_SECRET);
  (await cookies()).set(SESSION_COOKIE_NAME, token, cookieOptions);
}

export async function clearSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE_NAME);
}
