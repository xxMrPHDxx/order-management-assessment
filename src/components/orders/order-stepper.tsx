import type { OrderStatus } from "@/generated/prisma/enums";
import { trackingFor } from "@/lib/orders/tracking";

export function OrderStepper({ status }: { status: OrderStatus }) {
  const { steps, currentIndex } = trackingFor(status);
  const progress = (currentIndex / (steps.length - 1)) * 100;

  return (
    <div>
      <div className="relative">
        <div aria-hidden="true" className="absolute top-4 right-0 left-0 h-0.5 bg-slate-200" />
        <div
          aria-hidden="true"
          className="absolute top-4 left-0 h-0.5 bg-emerald-600 transition-all"
          style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
        />

        <ol className="relative grid grid-cols-5 gap-1">
          {steps.map((step) => {
            const circleClass =
              step.state === "complete"
                ? "border-emerald-600 bg-emerald-600 text-white"
                : step.state === "current"
                  ? "border-slate-900 bg-slate-900 text-white ring-4 ring-slate-200"
                  : "border-slate-300 bg-white text-slate-400";

            const labelClass = step.state === "upcoming" ? "text-slate-400" : "text-slate-900";

            return (
              <li
                key={step.key}
                aria-current={step.state === "current" ? "step" : undefined}
                className="flex flex-col items-center gap-2 text-center"
              >
                <span
                  className={`z-10 flex size-8 items-center justify-center rounded-full border-2 text-xs font-semibold ${circleClass}`}
                >
                  {step.state === "complete" ? (
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="size-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.5 7.55a1 1 0 0 1-1.42 0l-3.5-3.524a1 1 0 1 1 1.42-1.408l2.79 2.809 6.79-6.835a1 1 0 0 1 1.414-.006Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <span aria-hidden="true">{steps.indexOf(step) + 1}</span>
                  )}
                </span>
                <span className={`text-xs font-semibold sm:text-sm ${labelClass}`}>
                  {step.label}
                  {step.state === "current" ? <span className="sr-only"> (current)</span> : null}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
