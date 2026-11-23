import { describe, expect, it } from "vitest";

import {
  parseSupplierFilters,
  supplierOrdersHref,
  utcDayEnd,
  utcDayStart,
} from "@/lib/orders/filters";

describe("supplier filter parsing", () => {
  it("defaults to page 1 with no filters", () => {
    const filters = parseSupplierFilters({});
    expect(filters.page).toBe(1);
    expect(filters.q).toBeUndefined();
    expect(filters.status).toBeUndefined();
    expect(filters.from).toBeUndefined();
    expect(filters.to).toBeUndefined();
  });

  it("maps the PENDING label to the stored status", () => {
    const filters = parseSupplierFilters({ status: "PENDING" });
    expect(filters.raw.status).toBe("PENDING");
    expect(filters.status).toBe("PENDING_SUPPLIER_APPROVAL");
  });

  it("keeps a real status unchanged", () => {
    expect(parseSupplierFilters({ status: "IN_TRANSIT" }).status).toBe("IN_TRANSIT");
  });

  it("falls back safely for invalid filters", () => {
    const filters = parseSupplierFilters({
      status: "SOMETHING_ELSE",
      page: "-4",
      from: "2026-13-01",
      to: "not-a-date",
    });

    expect(filters.status).toBeUndefined();
    expect(filters.page).toBe(1);
    expect(filters.from).toBeUndefined();
    expect(filters.to).toBeUndefined();
  });

  it("uses inclusive UTC day boundaries", () => {
    expect(utcDayStart("2026-11-11").toISOString()).toBe("2026-11-11T00:00:00.000Z");
    expect(utcDayEnd("2026-11-11").toISOString()).toBe("2026-11-11T23:59:59.999Z");

    const filters = parseSupplierFilters({ from: "2026-11-01", to: "2026-11-30" });
    expect(filters.from?.toISOString()).toBe("2026-11-01T00:00:00.000Z");
    expect(filters.to?.toISOString()).toBe("2026-11-30T23:59:59.999Z");
  });

  it("combines search, status, and dates", () => {
    const filters = parseSupplierFilters({
      q: "  acme  ",
      status: "DELIVERED",
      from: "2026-10-01",
      to: "2026-10-31",
      page: "2",
    });

    expect(filters.q).toBe("acme");
    expect(filters.raw).toEqual({
      q: "acme",
      status: "DELIVERED",
      from: "2026-10-01",
      to: "2026-10-31",
      page: 2,
    });
  });

  it("builds shareable URLs and preserves filters", () => {
    const filters = parseSupplierFilters({ q: "acme", status: "PENDING" });
    expect(supplierOrdersHref(filters.raw, 1)).toBe("/supplier/orders?q=acme&status=PENDING");
    expect(supplierOrdersHref(filters.raw, 3)).toBe(
      "/supplier/orders?q=acme&status=PENDING&page=3",
    );
  });
});
