import type { Metadata } from "next";

import { requirePageRole } from "@/lib/auth/page-guards";

export const metadata: Metadata = {
  title: "My orders",
};

export default async function CustomerOrdersPage() {
  const session = await requirePageRole("customer");

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">My orders</h1>
      <p className="mt-2 text-sm text-slate-600">
        Signed in as <strong className="font-semibold text-slate-900">{session.name}</strong>.
      </p>

      <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-8">
        <h2 className="text-base font-semibold text-slate-900">Order list coming next</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Phase 4 adds catalog selection, order creation, the customer order list, and invoice
          downloads. This page confirms that the customer session and route guard are working.
        </p>
      </div>
    </div>
  );
}
