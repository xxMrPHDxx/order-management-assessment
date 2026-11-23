import { z } from "zod";

import type { OrderStatus } from "@/generated/prisma/enums";

export const DASHBOARD_PAGE_SIZE = 10;

export const DASHBOARD_STATUS_FILTERS = [
  "PENDING",
  "ACCEPTED",
  "DISPATCHED",
  "IN_TRANSIT",
  "DELIVERED",
  "REJECTED",
] as const;

export type DashboardStatusFilter = (typeof DASHBOARD_STATUS_FILTERS)[number];

export const DASHBOARD_STATUS_LABELS: Record<DashboardStatusFilter, string> = {
  PENDING: "Pending approval",
  ACCEPTED: "Accepted",
  DISPATCHED: "Dispatched",
  IN_TRANSIT: "In transit",
  DELIVERED: "Delivered",
  REJECTED: "Rejected",
};

/**
 * The dashboard exposes "PENDING" while the database stores
 * PENDING_SUPPLIER_APPROVAL. Map deliberately at the query boundary.
 */
export function dashboardStatusToStored(status: DashboardStatusFilter): OrderStatus {
  return status === "PENDING" ? "PENDING_SUPPLIER_APPROVAL" : status;
}

function isValidDateOnly(value: string): boolean {
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

const dateOnlySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
  .refine(isValidDateOnly, "Invalid calendar date");

const rawFilterSchema = z.object({
  q: z.string().trim().max(100).catch(""),
  status: z.enum(DASHBOARD_STATUS_FILTERS).optional().catch(undefined),
  from: dateOnlySchema.optional().catch(undefined),
  to: dateOnlySchema.optional().catch(undefined),
  page: z.coerce.number().int().min(1).catch(1),
});

export type RawSupplierFilters = {
  q?: string;
  status?: DashboardStatusFilter;
  from?: string;
  to?: string;
  page: number;
};

export type SupplierFilters = {
  q?: string;
  status?: OrderStatus;
  from?: Date;
  to?: Date;
  page: number;
  raw: RawSupplierFilters;
};

function firstValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export function utcDayStart(day: string): Date {
  return new Date(`${day}T00:00:00.000Z`);
}

export function utcDayEnd(day: string): Date {
  return new Date(`${day}T23:59:59.999Z`);
}

export function parseSupplierFilters(
  input: Record<string, string | string[] | undefined>,
): SupplierFilters {
  const parsed = rawFilterSchema.parse({
    q: firstValue(input.q),
    status: firstValue(input.status),
    from: firstValue(input.from),
    to: firstValue(input.to),
    page: firstValue(input.page),
  });

  const q = parsed.q.length > 0 ? parsed.q : undefined;
  const raw: RawSupplierFilters = {
    ...(q ? { q } : {}),
    ...(parsed.status ? { status: parsed.status } : {}),
    ...(parsed.from ? { from: parsed.from } : {}),
    ...(parsed.to ? { to: parsed.to } : {}),
    page: parsed.page,
  };

  return {
    raw,
    ...(q ? { q } : {}),
    ...(parsed.status ? { status: dashboardStatusToStored(parsed.status) } : {}),
    ...(parsed.from ? { from: utcDayStart(parsed.from) } : {}),
    ...(parsed.to ? { to: utcDayEnd(parsed.to) } : {}),
    page: parsed.page,
  };
}

export function supplierOrdersHref(raw: RawSupplierFilters, page = raw.page): string {
  const params = new URLSearchParams();
  if (raw.q) params.set("q", raw.q);
  if (raw.status) params.set("status", raw.status);
  if (raw.from) params.set("from", raw.from);
  if (raw.to) params.set("to", raw.to);
  if (page > 1) params.set("page", String(page));

  const query = params.toString();
  return query ? `/supplier/orders?${query}` : "/supplier/orders";
}

export function hasActiveFilters(raw: RawSupplierFilters): boolean {
  return Boolean(raw.q || raw.status || raw.from || raw.to);
}
