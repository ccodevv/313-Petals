import { cn } from "@/lib/utils/cn";

export function PageSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex min-h-[40vh] items-center justify-center", className)}>
      <span
        className="h-8 w-8 animate-spin rounded-full border-2 border-rose-600 border-t-transparent"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
