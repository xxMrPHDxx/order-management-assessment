import type { OrderStatus } from "@/generated/prisma/enums";

export const ORDER_STATUSES = [
  "PENDING_SUPPLIER_APPROVAL",
  "ACCEPTED",
  "DISPATCHED",
  "IN_TRANSIT",
  "DELIVERED",
  "REJECTED",
] as const satisfies readonly OrderStatus[];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_SUPPLIER_APPROVAL: "Pending approval",
  ACCEPTED: "Accepted",
  DISPATCHED: "Dispatched",
  IN_TRANSIT: "In transit",
  DELIVERED: "Delivered",
  REJECTED: "Rejected",
};

export const INVOICE_AVAILABLE_STATUSES = [
  "ACCEPTED",
  "DISPATCHED",
  "IN_TRANSIT",
  "DELIVERED",
] as const satisfies readonly OrderStatus[];

export function canDownloadInvoice(status: OrderStatus): boolean {
  return (INVOICE_AVAILABLE_STATUSES as readonly OrderStatus[]).includes(status);
}

export function invoiceNumberFor(orderNumber: string): string {
  return orderNumber.replace(/^ORD-/, "INV-");
}
