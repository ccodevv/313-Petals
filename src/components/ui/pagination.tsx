import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export function Pagination({
  currentPage,
  totalPages,
  buildHref,
}: {
  currentPage: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Pagination">
      <PaginationLink
        href={buildHref(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        Previous
      </PaginationLink>
      {pages.map((page) => (
        <Link
          key={page}
          href={buildHref(page)}
          aria-current={page === currentPage ? "page" : undefined}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium",
            page === currentPage
              ? "bg-rose-600 text-white"
              : "text-stone-600 hover:bg-stone-100",
          )}
        >
          {page}
        </Link>
      ))}
      <PaginationLink
        href={buildHref(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      >
        Next
      </PaginationLink>
    </nav>
  );
}

function PaginationLink({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span className="rounded-full px-3 py-2 text-sm text-stone-300">
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className="rounded-full px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100"
    >
      {children}
    </Link>
  );
}
