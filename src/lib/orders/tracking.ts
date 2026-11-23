import type { OrderStatus } from "@/generated/prisma/enums";

export const TRACKING_STEPS = [
  { key: "placed", label: "Placed" },
  { key: "accepted", label: "Accepted" },
  { key: "dispatched", label: "Dispatched" },
  { key: "in_transit", label: "In transit" },
  { key: "delivered", label: "Delivered" },
] as const;

export type TrackingStepState = "complete" | "current" | "upcoming";

export type TrackingStep = {
  key: (typeof TRACKING_STEPS)[number]["key"];
  label: string;
  state: TrackingStepState;
};

const STATUS_INDEX: Record<Exclude<OrderStatus, "REJECTED">, number> = {
  PENDING_SUPPLIER_APPROVAL: 0,
  ACCEPTED: 1,
  DISPATCHED: 2,
  IN_TRANSIT: 3,
  DELIVERED: 4,
};

export type TrackingProgress = {
  steps: TrackingStep[];
  rejected: boolean;
  currentIndex: number;
};

export function trackingFor(status: OrderStatus): TrackingProgress {
  const rejected = status === "REJECTED";
  const currentIndex = rejected ? 0 : STATUS_INDEX[status];

  return {
    rejected,
    currentIndex,
    steps: TRACKING_STEPS.map((step, index) => {
      let state: TrackingStepState = "upcoming";

      if (index < currentIndex) {
        state = "complete";
      } else if (index === currentIndex) {
        state = !rejected && status === "DELIVERED" ? "complete" : "current";
      }

      return { ...step, state };
    }),
  };
}
