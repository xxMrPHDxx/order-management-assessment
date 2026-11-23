import type { Metadata } from "next";
import Link from "next/link";

import { StatusBadge } from "@/components/orders/status-badge";
import { OrderActions } from "@/components/supplier/order-actions";
import { SupplierFiltersBar } from "@/components/supplier/supplier-filters-bar";
import { SupplierPagination } from "@/components/supplier/supplier-pagination";
import { requirePageRole } from "@/lib/auth/page-guards";
import { env } from "@/lib/env";
import { formatDate, formatMoney } from "@/lib/orders/format";
import { hasActiveFilters, parseSupplierFilters } from "@/lib/orders/filters";
import { listSupplierOrders } from "@/lib/orders/service";

export const metadata: Metadata = {
  title: "Supplier dashboard",
};

export default async function SupplierOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requirePageRole("supplier");
  const params = await searchParams;
  const filters = parseSupplierFilters(params);
  const result = await listSupplierOrders(filters);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Supplier dashboard
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Signed in as <strong className="font-semibold text-slate-900">{session.name}</strong> ·{" "}
            {result.totalItems} order{result.totalItems === 1 ? "" : "s"} matched
          </p>
        </div>
      </div>

      <div className="mt-6">
        <SupplierFiltersBar filters={filters.raw} />
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead className="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">
                Order
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Customer
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Placed
              </th>
              <th scope="col" className="px-4 py-3 text-right font-medium">
                Items
              </th>
              <th scope="col" className="px-4 py-3 text-right font-medium">
                Total
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-right font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {result.orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center">
                  <p className="text-sm font-semibold text-slate-900">
                    No orders match these filters.
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Adjust the search, status, or date range.
                  </p>
                  {hasActiveFilters(filters.raw) ? (
                    <Link
                      href="/supplier/orders"
                      className="mt-4 inline-flex text-sm font-semibold text-slate-700 hover:underline"
                    >
                      Clear filters
                    </Link>
                  ) : null}
                </td>
              </tr>
            ) : (
              result.orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-3 font-semibold whitespace-nowrap text-slate-900">
                    <Link
                      href={`/supplier/orders/${order.orderNumber}`}
                      className="hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{order.customer.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                    {formatDate(order.createdAt, env.APP_TIMEZONE)}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">{order._count.items}</td>
                  <td className="px-4 py-3 text-right font-medium whitespace-nowrap text-slate-900">
                    {formatMoney(order.grandTotal.toFixed(2), env.CURRENCY)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3">
                    <OrderActions orderNumber={order.orderNumber} status={order.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <SupplierPagination
        filters={filters.raw}
        page={result.page}
        pageSize={result.pageSize}
        totalItems={result.totalItems}
        totalPages={result.totalPages}
      />
    </div>
  );
}
