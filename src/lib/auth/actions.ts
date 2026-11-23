"use server";

import { redirect } from "next/navigation";

import { clearSession, establishSession } from "./cookies";
import { loginSchema, type LoginState } from "./login";
import { createMockSession } from "./service";

export async function loginAction(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    role: formData.get("role"),
    customerId: formData.get("customerId") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Choose a role to continue." };
  }

  const result = await createMockSession(parsed.data);
  if (!result.ok) {
    return { error: result.message };
  }

  await establishSession(result.session);
  redirect(result.session.role === "customer" ? "/customer/orders" : "/supplier/orders");
}

export async function logoutAction(): Promise<void> {
  await clearSession();
  redirect("/");
}
