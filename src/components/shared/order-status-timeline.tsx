import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { ORDER_STATUSES, ORDER_STATUS_LABELS, type OrderStatus } from "@/config/constants";

const TIMELINE_STEPS: OrderStatus[] = ORDER_STATUSES.filter((s) => s !== "cancelled");

export function OrderStatusTimeline({ status }: { status: OrderStatus }) {
  if (status === "cancelled") {
    return (
      <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
        This order was cancelled.
      </div>
    );
  }

  const currentIndex = TIMELINE_STEPS.indexOf(status);

  return (
    <ol className="flex flex-wrap gap-x-6 gap-y-3">
      {TIMELINE_STEPS.map((step, index) => {
        const done = index <= currentIndex;
        return (
          <li key={step} className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                done ? "bg-rose-600 text-white" : "bg-stone-200 text-stone-500",
              )}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : index + 1}
            </span>
            <span
              className={cn(
                "text-sm font-medium",
                done ? "text-stone-900" : "text-stone-400",
              )}
            >
              {ORDER_STATUS_LABELS[step]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
