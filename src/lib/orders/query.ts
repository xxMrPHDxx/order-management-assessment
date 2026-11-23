import type { Prisma } from "@/generated/prisma/client";
import type { OrderStatus } from "@/generated/prisma/enums";

import { DASHBOARD_PAGE_SIZE } from "./filters";

export function buildSupplierOrderWhere(filters: {
  q?: string;
  status?: OrderStatus;
  from?: Date;
  to?: Date;
}): Prisma.OrderWhereInput {
  const where: Prisma.OrderWhereInput = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.from || filters.to) {
    where.createdAt = {
      ...(filters.from ? { gte: filters.from } : {}),
      ...(filters.to ? { lte: filters.to } : {}),
    };
  }

  if (filters.q) {
    where.OR = [
      { orderNumber: { contains: filters.q, mode: "insensitive" } },
      { customer: { name: { contains: filters.q, mode: "insensitive" } } },
    ];
  }

  return where;
}

export function paginationFor(totalItems: number, requestedPage: number) {
  const totalPages = Math.max(1, Math.ceil(totalItems / DASHBOARD_PAGE_SIZE));
  const page = Math.min(Math.max(1, requestedPage), totalPages);

  return {
    totalItems,
    totalPages,
    page,
    skip: (page - 1) * DASHBOARD_PAGE_SIZE,
    take: DASHBOARD_PAGE_SIZE,
  };
}
