import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";
import { getSession } from "@/lib/auth/cookies";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "Sign in",
};

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const session = await getSession();
  if (session) {
    redirect(session.role === "customer" ? "/customer/orders" : "/supplier/orders");
  }

  const customers = await prisma.customer.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true },
  });

  const params = await searchParams;
  const initialError =
    params.error === "forbidden" ? "Your session does not have access to that area." : null;

  return (
    <div className="mx-auto flex w-full max-w-6xl justify-center px-4 py-16 sm:px-6">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Sign in</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          This is a mock authentication flow. Choosing a role sets the session used for server-side
          access control.
        </p>

        <LoginForm customers={customers} initialError={initialError} />

        <Link
          href="/"
          className="mt-6 inline-flex text-sm font-semibold text-slate-700 hover:underline"
        >
          Back to overview
        </Link>
      </div>
    </div>
  );
}
