import { describe, expect, it } from "vitest";

import type { OrderStatus } from "@/generated/prisma/enums";
import { ALLOWED_TRANSITIONS, canTransition, supplierActionsFor } from "@/lib/orders/state-machine";

const statuses: OrderStatus[] = [
  "PENDING_SUPPLIER_APPROVAL",
  "ACCEPTED",
  "DISPATCHED",
  "IN_TRANSIT",
  "DELIVERED",
  "REJECTED",
];

describe("order state machine", () => {
  it("allows exactly the documented transitions", () => {
    for (const from of statuses) {
      for (const to of statuses) {
        const expected = ALLOWED_TRANSITIONS[from].includes(to);
        expect(canTransition(from, to), `${from} -> ${to}`).toBe(expected);
      }
    }
  });

  it("accepts or rejects a pending order", () => {
    expect(canTransition("PENDING_SUPPLIER_APPROVAL", "ACCEPTED")).toBe(true);
    expect(canTransition("PENDING_SUPPLIER_APPROVAL", "REJECTED")).toBe(true);
    expect(canTransition("PENDING_SUPPLIER_APPROVAL", "DISPATCHED")).toBe(false);
  });

  it("does not skip logistics steps", () => {
    expect(canTransition("ACCEPTED", "IN_TRANSIT")).toBe(false);
    expect(canTransition("DISPATCHED", "DELIVERED")).toBe(false);
  });

  it("treats delivered and rejected as terminal", () => {
    for (const terminal of ["DELIVERED", "REJECTED"] as const) {
      for (const to of statuses) {
        expect(canTransition(terminal, to)).toBe(false);
      }
      expect(ALLOWED_TRANSITIONS[terminal]).toHaveLength(0);
    }
  });

  it("returns the supplier actions for each status", () => {
    expect(supplierActionsFor("PENDING_SUPPLIER_APPROVAL").map((a) => a.label)).toEqual([
      "Accept",
      "Reject",
    ]);
    expect(supplierActionsFor("DISPATCHED")).toEqual([
      { toStatus: "IN_TRANSIT", label: "Mark in transit", tone: "secondary" },
    ]);
    expect(supplierActionsFor("DELIVERED")).toEqual([]);
  });
});
