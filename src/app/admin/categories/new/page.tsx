import type { Metadata } from "next";
import { CategoryForm } from "@/components/admin/category-form";
import { createCategory } from "@/features/categories/actions";

export const metadata: Metadata = { title: "New Category" };

export default function NewCategoryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-stone-900">New Category</h1>
      <CategoryForm action={createCategory} />
    </div>
  );
}
