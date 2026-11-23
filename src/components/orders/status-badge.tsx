import type { OrderStatus } from "@/generated/prisma/enums";
import { ORDER_STATUS_LABELS } from "@/lib/orders/status";

const badgeStyles: Record<OrderStatus, string> = {
  PENDING_SUPPLIER_APPROVAL: "bg-amber-50 text-amber-800 ring-amber-200",
  ACCEPTED: "bg-blue-50 text-blue-800 ring-blue-200",
  DISPATCHED: "bg-indigo-50 text-indigo-800 ring-indigo-200",
  IN_TRANSIT: "bg-violet-50 text-violet-800 ring-violet-200",
  DELIVERED: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  REJECTED: "bg-rose-50 text-rose-800 ring-rose-200",
};

export function StatusBadge({
  status,
  className = "",
}: {
  status: OrderStatus;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${badgeStyles[status]} ${className}`}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
