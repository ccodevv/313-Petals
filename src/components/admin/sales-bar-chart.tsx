import { formatCurrency } from "@/lib/utils/format";
import type { SalesBucket } from "@/features/reports/queries";

export function SalesBarChart({ buckets }: { buckets: SalesBucket[] }) {
  const max = Math.max(1, ...buckets.map((b) => b.total));

  return (
    <div className="flex items-end gap-2" style={{ height: 160 }}>
      {buckets.map((bucket) => (
        <div key={bucket.label} className="flex flex-1 flex-col items-center gap-1">
          <span className="text-[10px] text-stone-400">
            {bucket.total > 0 ? formatCurrency(bucket.total) : ""}
          </span>
          <div className="flex w-full flex-1 items-end">
            <div
              className="w-full rounded-t-sm bg-rose-500"
              style={{ height: `${Math.max(2, (bucket.total / max) * 100)}%` }}
            />
          </div>
          <span className="text-[10px] text-stone-500">{bucket.label}</span>
        </div>
      ))}
    </div>
  );
}
