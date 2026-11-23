import { describe, expect, it } from "vitest";

import type { OrderStatus } from "@/generated/prisma/enums";
import { canDownloadInvoice, invoiceNumberFor } from "@/lib/orders/status";

const statuses: OrderStatus[] = [
  "PENDING_SUPPLIER_APPROVAL",
  "ACCEPTED",
  "DISPATCHED",
  "IN_TRANSIT",
  "DELIVERED",
  "REJECTED",
];

describe("invoice eligibility", () => {
  it("is unavailable before supplier acceptance", () => {
    expect(canDownloadInvoice("PENDING_SUPPLIER_APPROVAL")).toBe(false);
  });

  it("is unavailable for rejected orders", () => {
    expect(canDownloadInvoice("REJECTED")).toBe(false);
  });

  it("is available for accepted and later statuses", () => {
    for (const status of ["ACCEPTED", "DISPATCHED", "IN_TRANSIT", "DELIVERED"] as const) {
      expect(canDownloadInvoice(status)).toBe(true);
    }
  });

  it("covers exactly the expected matrix", () => {
    const available = statuses.filter((status) => canDownloadInvoice(status));
    expect(available).toEqual(["ACCEPTED", "DISPATCHED", "IN_TRANSIT", "DELIVERED"]);
  });

  it("derives a mock invoice number from the order number", () => {
    expect(invoiceNumberFor("ORD-2026-000042")).toBe("INV-2026-000042");
  });
});
