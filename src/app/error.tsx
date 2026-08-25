"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-4 text-center">
      <p className="text-sm font-medium uppercase tracking-wide text-rose-600">Error</p>
      <h1 className="text-2xl font-semibold text-stone-900">Something went wrong</h1>
      <p className="max-w-sm text-stone-500">
        Please try again. If the problem continues, come back a little later.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
