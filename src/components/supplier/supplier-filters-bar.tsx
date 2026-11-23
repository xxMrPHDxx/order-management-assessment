import Link from "next/link";

import {
  DASHBOARD_STATUS_FILTERS,
  DASHBOARD_STATUS_LABELS,
  type RawSupplierFilters,
} from "@/lib/orders/filters";

export function SupplierFiltersBar({ filters }: { filters: RawSupplierFilters }) {
  return (
    <form
      method="get"
      action="/supplier/orders"
      className="rounded-xl border border-slate-200 bg-white p-4"
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_180px_160px_160px_auto]">
        <div>
          <label htmlFor="q" className="text-xs font-medium text-slate-600">
            Search
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={filters.q ?? ""}
            maxLength={100}
            placeholder="Order ID or customer name"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="status" className="text-xs font-medium text-slate-600">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={filters.status ?? ""}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 focus:outline-none"
          >
            <option value="">All statuses</option>
            {DASHBOARD_STATUS_FILTERS.map((status) => (
              <option key={status} value={status}>
                {DASHBOARD_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="from" className="text-xs font-medium text-slate-600">
            From
          </label>
          <input
            id="from"
            name="from"
            type="date"
            defaultValue={filters.from ?? ""}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="to" className="text-xs font-medium text-slate-600">
            To
          </label>
          <input
            id="to"
            name="to"
            type="date"
            defaultValue={filters.to ?? ""}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 focus:outline-none"
          />
        </div>

        <div className="flex items-end gap-2">
          <button
            type="submit"
            className="inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
          >
            Apply
          </button>
          <Link
            href="/supplier/orders"
            className="inline-flex rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
          >
            Reset
          </Link>
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Dates are inclusive and interpreted in UTC. Filters combine and stay in the URL.
      </p>
    </form>
  );
}
