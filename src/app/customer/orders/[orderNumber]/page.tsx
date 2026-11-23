import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { StatusBadge } from "@/components/orders/status-badge";
import { requirePageRole } from "@/lib/auth/page-guards";
import { env } from "@/lib/env";
import { formatDateTime, formatMoney } from "@/lib/orders/format";
import { orderNumberSchema } from "@/lib/orders/schema";
import { getOrderForViewer } from "@/lib/orders/service";
import { canDownloadInvoice } from "@/lib/orders/status";

export const metadata: Metadata = {
  title: "Order detail",
};

export default async function CustomerOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const session = await requirePageRole("customer");
  const { orderNumber } = await params;

  const parsed = orderNumberSchema.safeParse(orderNumber);
  if (!parsed.success) {
    notFound();
  }

  const order = await getOrderForViewer(parsed.data, session);
  if (!order) {
    notFound();
  }

  const { created } = await searchParams;
  const invoiceAvailable = canDownloadInvoice(order.status);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      {created === "1" ? (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Order placed. It is now waiting for supplier approval.
        </div>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/customer/orders"
            className="text-sm font-semibold text-slate-600 hover:underline"
          >
            ← Back to my orders
          </Link>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
            {order.orderNumber}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Placed {formatDateTime(order.createdAt, env.APP_TIMEZONE)} · {order.items.length} line
            {order.items.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <StatusBadge status={order.status} />
          {invoiceAvailable ? (
            <a
              href={`/api/orders/${order.orderNumber}/invoice`}
              className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
            >
              Download invoice
            </a>
          ) : (
            <p className="max-w-xs text-right text-xs text-slate-500">
              {order.status === "REJECTED"
                ? "This order was rejected, so no invoice is available."
                : "The invoice becomes available once the supplier accepts the order."}
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">
                  Item
                </th>
                <th scope="col" className="px-4 py-3 text-right font-medium">
                  Qty
                </th>
                <th scope="col" className="px-4 py-3 text-right font-medium">
                  Unit price
                </th>
                <th scope="col" className="px-4 py-3 text-right font-medium">
                  Line total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{item.product.name}</p>
                    <p className="text-xs text-slate-500">{item.product.sku}</p>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">{item.quantity}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap text-slate-600">
                    {formatMoney(item.unitPrice.toFixed(2), env.CURRENCY)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium whitespace-nowrap text-slate-900">
                    {formatMoney(item.lineTotal.toFixed(2), env.CURRENCY)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-slate-200 bg-slate-50/60">
              <tr>
                <td colSpan={3} className="px-4 py-3 text-right text-sm text-slate-600">
                  Grand total
                </td>
                <td className="px-4 py-3 text-right text-base font-semibold whitespace-nowrap text-slate-900">
                  {formatMoney(order.grandTotal.toFixed(2), env.CURRENCY)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <aside className="space-y-4">
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-900">Shipping address</h2>
            <p className="mt-2 text-sm whitespace-pre-line text-slate-600">
              {order.shippingAddress}
            </p>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-900">Customer</h2>
            <p className="mt-2 text-sm text-slate-900">{order.customer.name}</p>
            <p className="text-sm text-slate-600">{order.customer.email}</p>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-900">Status history</h2>
            <ol className="mt-3 space-y-3">
              {order.history.map((entry) => (
                <li key={entry.id} className="text-sm">
                  <p className="font-medium text-slate-900">
                    {entry.toStatus.replaceAll("_", " ")}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatDateTime(entry.createdAt, env.APP_TIMEZONE)} · {entry.actorRole}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>
    </div>
  );
}
