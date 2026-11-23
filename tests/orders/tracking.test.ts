import { describe, expect, it } from "vitest";

import type { OrderStatus } from "@/generated/prisma/enums";
import { formatTimelineTimestamp } from "@/lib/orders/format";
import { trackingFor } from "@/lib/orders/tracking";

const expectedIndex: Record<Exclude<OrderStatus, "REJECTED">, number> = {
  PENDING_SUPPLIER_APPROVAL: 0,
  ACCEPTED: 1,
  DISPATCHED: 2,
  IN_TRANSIT: 3,
  DELIVERED: 4,
};

describe("tracking stepper", () => {
  it("maps each status to the right step", () => {
    for (const [status, index] of Object.entries(expectedIndex) as Array<
      [Exclude<OrderStatus, "REJECTED">, number]
    >) {
      const progress = trackingFor(status);
      expect(progress.currentIndex, status).toBe(index);
      expect(progress.rejected).toBe(false);
      expect(progress.steps).toHaveLength(5);
    }
  });

  it("marks earlier steps complete and later steps upcoming", () => {
    const progress = trackingFor("DISPATCHED");
    expect(progress.steps.map((step) => step.state)).toEqual([
      "complete",
      "complete",
      "current",
      "upcoming",
      "upcoming",
    ]);
  });

  it("marks a delivered order fully complete", () => {
    const progress = trackingFor("DELIVERED");
    expect(progress.steps.every((step) => step.state === "complete")).toBe(true);
  });

  it("keeps a pending order at the first step", () => {
    const progress = trackingFor("PENDING_SUPPLIER_APPROVAL");
    expect(progress.steps[0]?.state).toBe("current");
    expect(progress.steps[1]?.state).toBe("upcoming");
  });

  it("flags rejected orders as terminated instead of a stalled stepper", () => {
    const progress = trackingFor("REJECTED");
    expect(progress.rejected).toBe(true);
    expect(progress.steps[0]?.state).toBe("current");
    expect(progress.steps.slice(1).every((step) => step.state === "upcoming")).toBe(true);
  });
});

describe("timeline timestamp", () => {
  it("formats like 'Nov 11, 2026, 14:00'", () => {
    expect(formatTimelineTimestamp(new Date("2026-11-11T14:00:00.000Z"), "UTC")).toBe(
      "Nov 11, 2026, 14:00",
    );
  });

  it("respects the configured timezone", () => {
    expect(formatTimelineTimestamp(new Date("2026-11-11T14:00:00.000Z"), "Asia/Singapore")).toBe(
      "Nov 11, 2026, 22:00",
    );
  });
});
