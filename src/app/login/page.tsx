import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl justify-center px-4 py-16 sm:px-6">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Sign in</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Role selection and mock authentication arrive in Phase 3. This route exists so the
          navigation and layout can be verified now.
        </p>
        <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
          Next: choose <strong className="font-semibold text-slate-900">Customer</strong> or{" "}
          <strong className="font-semibold text-slate-900">Supplier</strong> to start a mock
          session.
        </div>
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
