import type { OrderStatus } from "@/generated/prisma/enums";
import { formatTimelineTimestamp } from "@/lib/orders/format";

import { OrderStepper } from "./order-stepper";
import { OrderTimeline, type TimelineEntry } from "./order-timeline";

export function OrderTracking({
  status,
  history,
  timeZone,
}: {
  status: OrderStatus;
  history: TimelineEntry[];
  timeZone: string;
}) {
  const rejection = history.findLast((entry) => entry.toStatus === "REJECTED");

  return (
    <div className="space-y-8">
      {status === "REJECTED" ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-5">
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-rose-600 text-white"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="size-4">
                <path
                  fillRule="evenodd"
                  d="M18 10A8 8 0 1 1 2 10a8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <div>
              <p className="text-base font-semibold text-rose-900">Order rejected</p>
              <p className="mt-1 text-sm text-rose-800">
                This order is terminated and cannot progress further.
              </p>
              {rejection ? (
                <p className="mt-2 text-xs text-rose-700">
                  Rejected on {formatTimelineTimestamp(rejection.createdAt, timeZone)} by{" "}
                  {rejection.actorRole.toLowerCase()} ({rejection.actorName})
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        <OrderStepper status={status} />
      )}

      <div>
        <h3 className="text-sm font-semibold text-slate-900">Audit trail</h3>
        <p className="mt-1 mb-4 text-xs text-slate-500">
          Every status change, oldest first. History is append-only.
        </p>
        <OrderTimeline history={history} timeZone={timeZone} />
      </div>
    </div>
  );
}
