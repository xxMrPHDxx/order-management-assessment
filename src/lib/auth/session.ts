import { jwtVerify, SignJWT } from "jose";
import { z } from "zod";

export const SESSION_COOKIE_NAME = "of_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 8;

const customerSessionSchema = z.object({
  role: z.literal("customer"),
  customerId: z.string().uuid(),
  name: z.string().min(1),
});

const supplierSessionSchema = z.object({
  role: z.literal("supplier"),
  customerId: z.undefined().optional(),
  name: z.string().min(1),
});

export const sessionSchema = z.discriminatedUnion("role", [
  customerSessionSchema,
  supplierSessionSchema,
]);

export type Session = z.infer<typeof sessionSchema>;
export type Role = Session["role"];

const encoder = new TextEncoder();

function keyFromSecret(secret: string) {
  return encoder.encode(secret);
}

export async function signSession(
  session: Session,
  secret: string,
  options: { expiresIn?: string | number } = {},
): Promise<string> {
  return new SignJWT(session)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(options.expiresIn ?? `${SESSION_TTL_SECONDS}s`)
    .sign(keyFromSecret(secret));
}

export async function verifySession(token: string, secret: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, keyFromSecret(secret), {
      algorithms: ["HS256"],
    });
    const parsed = sessionSchema.safeParse(payload);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
