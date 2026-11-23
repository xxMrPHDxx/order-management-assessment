import type { OrderStatus } from "@/generated/prisma/enums";

export const ALLOWED_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  PENDING_SUPPLIER_APPROVAL: ["ACCEPTED", "REJECTED"],
  ACCEPTED: ["DISPATCHED"],
  DISPATCHED: ["IN_TRANSIT"],
  IN_TRANSIT: ["DELIVERED"],
  DELIVERED: [],
  REJECTED: [],
};

export const TERMINAL_STATUSES = [
  "DELIVERED",
  "REJECTED",
] as const satisfies readonly OrderStatus[];

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function isTerminalStatus(status: OrderStatus): boolean {
  return (TERMINAL_STATUSES as readonly OrderStatus[]).includes(status);
}

export type SupplierAction = {
  toStatus: OrderStatus;
  label: string;
  tone: "primary" | "danger" | "secondary";
};

const ACTION_LABELS: Record<OrderStatus, { label: string; tone: SupplierAction["tone"] }> = {
  PENDING_SUPPLIER_APPROVAL: { label: "Approve", tone: "primary" },
  ACCEPTED: { label: "Accept", tone: "primary" },
  DISPATCHED: { label: "Mark dispatched", tone: "secondary" },
  IN_TRANSIT: { label: "Mark in transit", tone: "secondary" },
  DELIVERED: { label: "Mark delivered", tone: "secondary" },
  REJECTED: { label: "Reject", tone: "danger" },
};

export function supplierActionsFor(status: OrderStatus): SupplierAction[] {
  return ALLOWED_TRANSITIONS[status].map((toStatus) => ({
    toStatus,
    label: ACTION_LABELS[toStatus].label,
    tone: ACTION_LABELS[toStatus].tone,
  }));
}
