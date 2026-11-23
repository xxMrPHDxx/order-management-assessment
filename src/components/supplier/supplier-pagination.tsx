import Link from "next/link";

import { supplierOrdersHref, type RawSupplierFilters } from "@/lib/orders/filters";

export function SupplierPagination({
  filters,
  page,
  pageSize,
  totalItems,
  totalPages,
}: {
  filters: RawSupplierFilters;
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}) {
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-600">
        Showing <span className="font-medium text-slate-900">{start}</span>–
        <span className="font-medium text-slate-900">{end}</span> of{" "}
        <span className="font-medium text-slate-900">{totalItems}</span> orders
      </p>

      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link
            href={supplierOrdersHref(filters, page - 1)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Previous
          </Link>
        ) : (
          <span className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-400">
            Previous
          </span>
        )}

        <span className="px-2 text-sm text-slate-600">
          Page <span className="font-medium text-slate-900">{page}</span> of{" "}
          <span className="font-medium text-slate-900">{totalPages}</span>
        </span>

        {page < totalPages ? (
          <Link
            href={supplierOrdersHref(filters, page + 1)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Next
          </Link>
        ) : (
          <span className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-400">
            Next
          </span>
        )}
      </div>
    </div>
  );
}
