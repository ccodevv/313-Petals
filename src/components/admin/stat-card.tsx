import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "default" | "warning";
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <span
          className={
            tone === "warning"
              ? "flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700"
              : "flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-700"
          }
        >
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-stone-400">{label}</p>
          <p className="text-xl font-semibold text-stone-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
