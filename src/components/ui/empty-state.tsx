import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 px-6 py-16 text-center">
      <h3 className="text-base font-semibold text-stone-900">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-stone-500">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
