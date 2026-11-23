import type { Metadata } from "next";
import Link from "next/link";

import { OrderTracking } from "@/components/orders/order-tracking";
import { StatusBadge } from "@/components/orders/status-badge";
import { AuthError } from "@/lib/auth/authorization";
import { requirePageRole } from "@/lib/auth/page-guards";
import { env } from "@/lib/env";
import { formatDateTime } from "@/lib/orders/format";
import { orderNumberSchema } from "@/lib/orders/schema";
import { getOrderForViewer } from "@/lib/orders/service";
import { canDownloadInvoice } from "@/lib/orders/status";

export const metadata: Metadata = {
  title: "Track order",
};

export default async function TrackOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string | string[] }>;
}) {
  const session = await requirePageRole("customer");
  const params = await searchParams;
  const rawInput = Array.isArray(params.order) ? params.order[0] : params.order;
  const input = rawInput?.trim().toUpperCase() ?? "";

  let order: Awaited<ReturnType<typeof getOrderForViewer>> = null;
  let error: string | null = null;

  if (input) {
    const parsed = orderNumberSchema.safeParse(input);
    if (!parsed.success) {
      error = "Enter an order number in the format ORD-2026-000042.";
    } else {
      try {
        order = await getOrderForViewer(parsed.data, session);
        if (!order) {
          error = "No order was found with that number for your account.";
        }
      } catch (caught) {
        if (caught instanceof AuthError) {
          error = "No order was found with that number for your account.";
        } else {
          throw caught;
        }
      }
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Track an order</h1>
        <p className="mt-2 text-sm text-slate-600">
          Enter your order number to see its lifecycle and full audit trail.
        </p>
      </div>

      <form
        method="get"
        action="/customer/track"
        className="mt-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label htmlFor="order" className="text-xs font-medium text-slate-600">
            Order number
          </label>
          <input
            id="order"
            name="order"
            defaultValue={input}
            placeholder="ORD-2026-000042"
            autoComplete="off"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm tracking-wide text-slate-900 uppercase focus:border-slate-500 focus:ring-2 focus:ring-slate-200 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="inline-flex justify-center rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
        >
          Track order
        </button>
      </form>

      <p className="mt-2 text-xs text-slate-500">
        Customers can only track their own orders. Signed in as {session.name}.
      </p>

      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          {error}
        </p>
      ) : null}

      {order ? (
        <div className="mt-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-sm font-semibold text-slate-500">{order.orderNumber}</p>
              <p className="mt-1 text-sm text-slate-600">
                Placed {formatDateTime(order.createdAt, env.APP_TIMEZONE)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={order.status} />
              <Link
                href={`/customer/orders/${order.orderNumber}`}
                className="text-sm font-semibold text-slate-700 hover:underline"
              >
                View order
              </Link>
              {canDownloadInvoice(order.status) ? (
                <a
                  href={`/api/orders/${order.orderNumber}/invoice`}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
                >
                  Download invoice
                </a>
              ) : null}
            </div>
          </div>

          <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
            <OrderTracking
              status={order.status}
              history={order.history}
              timeZone={env.APP_TIMEZONE}
            />
          </section>
        </div>
      ) : null}
    </div>
  );
}
