import Link from "next/link";
import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { CategoryRowActions } from "@/components/admin/category-row-actions";
import { getAllCategoriesAdmin } from "@/features/categories/queries";

export const metadata: Metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  const categories = await getAllCategoriesAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-stone-900">Categories</h1>
        <Link href="/admin/categories/new" className={buttonVariants({ size: "sm" })}>
          <Plus className="h-4 w-4" /> New Category
        </Link>
      </div>

      {categories.length === 0 ? (
        <EmptyState title="No categories yet" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="text-stone-500">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Description</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-stone-50">
                  <td className="px-5 py-3 font-medium text-stone-900">{category.name}</td>
                  <td className="px-5 py-3 max-w-xs truncate text-stone-600">
                    {category.description}
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={category.is_active ? "success" : "neutral"}>
                      {category.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    <CategoryRowActions category={category} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
