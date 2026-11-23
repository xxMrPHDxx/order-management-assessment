"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { OrderStatus } from "@/generated/prisma/enums";
import { supplierActionsFor } from "@/lib/orders/state-machine";

export function OrderActions({
  orderNumber,
  status,
}: {
  orderNumber: string;
  status: OrderStatus;
}) {
  const router = useRouter();
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const actions = supplierActionsFor(status);
  if (actions.length === 0) {
    return <span className="text-xs text-slate-400">No further action</span>;
  }

  async function runTransition(toStatus: OrderStatus) {
    if (toStatus === "REJECTED" && !window.confirm("Reject this order? This cannot be undone.")) {
      return;
    }

    setPendingStatus(toStatus);
    setError(null);

    try {
      const response = await fetch(`/api/orders/${orderNumber}/transitions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toStatus }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: { message?: string };
        } | null;
        setError(payload?.error?.message ?? "Could not update the order.");
        return;
      }

      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setPendingStatus(null);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap items-center justify-end gap-2">
        {actions.map((action) => {
          const isPending = pendingStatus === action.toStatus;
          const toneClass =
            action.tone === "danger"
              ? "border border-rose-300 bg-white text-rose-700 hover:bg-rose-50"
              : action.tone === "primary"
                ? "bg-slate-900 text-white hover:bg-slate-700"
                : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100";

          return (
            <button
              key={action.toStatus}
              type="button"
              disabled={pendingStatus !== null}
              onClick={() => void runTransition(action.toStatus)}
              className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${toneClass}`}
            >
              {isPending ? "Working…" : action.label}
            </button>
          );
        })}
      </div>
      {error ? (
        <p role="alert" className="max-w-[220px] text-right text-xs text-rose-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
