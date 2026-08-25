import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-4 text-center">
      <p className="text-sm font-medium uppercase tracking-wide text-rose-600">404</p>
      <h1 className="text-2xl font-semibold text-stone-900">Page not found</h1>
      <p className="max-w-sm text-stone-500">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <Link href="/" className={buttonVariants()}>
        Back to shop
      </Link>
    </div>
  );
}
