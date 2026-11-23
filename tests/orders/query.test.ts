import { describe, expect, it } from "vitest";

import { buildSupplierOrderWhere, paginationFor } from "@/lib/orders/query";

describe("supplier order query builder", () => {
  it("returns an empty filter for no criteria", () => {
    expect(buildSupplierOrderWhere({})).toEqual({});
  });

  it("filters by status", () => {
    expect(buildSupplierOrderWhere({ status: "ACCEPTED" })).toEqual({
      status: "ACCEPTED",
    });
  });

  it("builds an inclusive date range", () => {
    const from = new Date("2026-11-01T00:00:00.000Z");
    const to = new Date("2026-11-30T23:59:59.999Z");
    expect(buildSupplierOrderWhere({ from, to })).toEqual({
      createdAt: { gte: from, lte: to },
    });
  });

  it("searches order number or customer name, case-insensitively", () => {
    expect(buildSupplierOrderWhere({ q: "acme" })).toEqual({
      OR: [
        { orderNumber: { contains: "acme", mode: "insensitive" } },
        { customer: { name: { contains: "acme", mode: "insensitive" } } },
      ],
    });
  });

  it("combines every filter", () => {
    const from = new Date("2026-11-01T00:00:00.000Z");
    const to = new Date("2026-11-30T23:59:59.999Z");

    expect(buildSupplierOrderWhere({ q: "00001", status: "DELIVERED", from, to })).toEqual({
      status: "DELIVERED",
      createdAt: { gte: from, lte: to },
      OR: [
        { orderNumber: { contains: "00001", mode: "insensitive" } },
        { customer: { name: { contains: "00001", mode: "insensitive" } } },
      ],
    });
  });
});

describe("pagination", () => {
  it("computes pages of 10", () => {
    expect(paginationFor(36, 1)).toMatchObject({ page: 1, totalPages: 4, skip: 0, take: 10 });
    expect(paginationFor(36, 2)).toMatchObject({ page: 2, skip: 10 });
    expect(paginationFor(36, 4)).toMatchObject({ page: 4, skip: 30 });
  });

  it("handles an exact multiple", () => {
    expect(paginationFor(30, 3)).toMatchObject({ page: 3, totalPages: 3, skip: 20 });
  });

  it("clamps pages beyond the end", () => {
    expect(paginationFor(36, 99)).toMatchObject({ page: 4, skip: 30 });
  });

  it("returns one empty page when there are no rows", () => {
    expect(paginationFor(0, 5)).toMatchObject({ page: 1, totalPages: 1, skip: 0 });
  });
});
