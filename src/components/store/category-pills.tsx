import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import type { Category } from "@/types";

export function CategoryPills({
  categories,
  activeSlug,
  basePath = "/products",
}: {
  categories: Category[];
  activeSlug?: string;
  basePath?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={basePath}
        className={cn(
          "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
          !activeSlug
            ? "border-rose-600 bg-rose-600 text-white"
            : "border-stone-300 text-stone-700 hover:border-rose-400",
        )}
      >
        All
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`${basePath}?category=${category.slug}`}
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
            activeSlug === category.slug
              ? "border-rose-600 bg-rose-600 text-white"
              : "border-stone-300 text-stone-700 hover:border-rose-400",
          )}
        >
          {category.name}
        </Link>
      ))}
    </div>
  );
}
