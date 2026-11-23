import type { Metadata } from "next";
import Link from "next/link";

import { StatusBadge } from "@/components/orders/status-badge";
import { requirePageRole } from "@/lib/auth/page-guards";
import { env } from "@/lib/env";
import { formatDate, formatMoney } from "@/lib/orders/format";
import { listCustomerOrders } from "@/lib/orders/service";
import { canDownloadInvoice } from "@/lib/orders/status";

export const metadata: Metadata = {
  title: "My orders",
};

export default async function CustomerOrdersPage() {
  const session = await requirePageRole("customer");
  const orders = await listCustomerOrders(session.customerId);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">My orders</h1>
          <p className="mt-2 text-sm text-slate-600">
            Signed in as <strong className="font-semibold text-slate-900">{session.name}</strong>.
          </p>
        </div>
        <Link
          href="/customer/orders/new"
          className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
        >
          New order
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <h2 className="text-base font-semibold text-slate-900">No orders yet</h2>
          <p className="mt-2 text-sm text-slate-600">
            Place your first order to see it here and track its progress.
          </p>
          <Link
            href="/customer/orders/new"
            className="mt-5 inline-flex rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Browse the catalog
          </Link>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">
                  Order
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Placed
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 text-right font-medium">
                  Items
                </th>
                <th scope="col" className="px-4 py-3 text-right font-medium">
                  Total
                </th>
                <th scope="col" className="px-4 py-3 text-right font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-3">
                    <Link
                      href={`/customer/orders/${order.orderNumber}`}
                      className="font-semibold text-slate-900 hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                    {formatDate(order.createdAt, env.APP_TIMEZONE)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">{order._count.items}</td>
                  <td className="px-4 py-3 text-right font-medium whitespace-nowrap text-slate-900">
                    {formatMoney(order.grandTotal.toFixed(2), env.CURRENCY)}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/customer/orders/${order.orderNumber}`}
                        className="text-sm font-semibold text-slate-700 hover:underline"
                      >
                        View
                      </Link>
                      {canDownloadInvoice(order.status) ? (
                        <a
                          href={`/api/orders/${order.orderNumber}/invoice`}
                          className="text-sm font-semibold text-slate-900 hover:underline"
                        >
                          Invoice
                        </a>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
