"use client";

import { useActionState, useState } from "react";

import { loginAction } from "@/lib/auth/actions";
import type { LoginState } from "@/lib/auth/login";

type CustomerOption = {
  id: string;
  name: string;
  email: string;
};

const roles = [
  { value: "customer", label: "Customer" },
  { value: "supplier", label: "Supplier" },
] as const;

export function LoginForm({
  customers,
  initialError,
}: {
  customers: CustomerOption[];
  initialError?: string | null;
}) {
  const [role, setRole] = useState<"customer" | "supplier">("customer");
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(loginAction, {
    error: initialError ?? null,
  });

  return (
    <form action={formAction} className="mt-8 space-y-6">
      <input type="hidden" name="role" value={role} />

      <fieldset>
        <legend className="text-sm font-medium text-slate-700">Sign in as</legend>
        <div className="mt-2 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
          {roles.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={role === option.value}
              onClick={() => setRole(option.value)}
              className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                role === option.value
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </fieldset>

      {role === "customer" ? (
        <div>
          <label htmlFor="customerId" className="text-sm font-medium text-slate-700">
            Customer account
          </label>
          <select
            id="customerId"
            name="customerId"
            required
            defaultValue={customers[0]?.id ?? ""}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:ring-2 focus:ring-slate-200 focus:outline-none"
          >
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name} — {customer.email}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-slate-500">
            Mock identity: this sets the customer used for order ownership checks.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          You will sign in as the demo supplier, <strong>Sam Patel</strong>.
        </div>
      )}

      {state.error ? (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending || customers.length === 0}
        className="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Signing in…" : "Continue"}
      </button>
    </form>
  );
}
