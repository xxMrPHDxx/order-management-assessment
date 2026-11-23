import type { ActorRole, OrderStatus } from "@/generated/prisma/enums";
import { formatTimelineTimestamp } from "@/lib/orders/format";
import { ORDER_STATUS_LABELS } from "@/lib/orders/status";

export type TimelineEntry = {
  id: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  actorRole: ActorRole;
  actorName: string;
  note: string | null;
  createdAt: Date;
};

const ROLE_LABELS: Record<ActorRole, string> = {
  CUSTOMER: "Customer",
  SUPPLIER: "Supplier",
  SYSTEM: "System",
};

function dotClass(status: OrderStatus) {
  if (status === "REJECTED") return "bg-rose-600 ring-rose-100";
  if (status === "DELIVERED") return "bg-emerald-600 ring-emerald-100";
  return "bg-slate-900 ring-slate-100";
}

export function OrderTimeline({
  history,
  timeZone,
}: {
  history: TimelineEntry[];
  timeZone: string;
}) {
  return (
    <ol className="relative ml-2 border-l border-slate-200">
      {history.map((entry, index) => {
        const isLast = index === history.length - 1;
        const title =
          entry.fromStatus === null
            ? "Order placed"
            : `Status updated to ${ORDER_STATUS_LABELS[entry.toStatus]}`;

        return (
          <li key={entry.id} className={isLast ? "ml-6 pb-1" : "ml-6 pb-7"}>
            <span
              aria-hidden="true"
              className={`absolute -left-1.5 mt-1.5 size-3 rounded-full ring-4 ${dotClass(entry.toStatus)}`}
            />
            <p className="text-sm font-semibold text-slate-900">{title}</p>
            <p className="mt-1 text-sm text-slate-600">
              on {formatTimelineTimestamp(entry.createdAt, timeZone)} ·{" "}
              {ROLE_LABELS[entry.actorRole]} ({entry.actorName})
            </p>
            {entry.note ? <p className="mt-1 text-xs text-slate-500">{entry.note}</p> : null}
          </li>
        );
      })}
    </ol>
  );
}
