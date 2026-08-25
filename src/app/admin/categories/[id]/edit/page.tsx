import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CategoryForm } from "@/components/admin/category-form";
import { updateCategory } from "@/features/categories/actions";
import { getCategoryById } from "@/features/categories/queries";

export const metadata: Metadata = { title: "Edit Category" };

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await getCategoryById(id);

  if (!category) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-stone-900">Edit Category</h1>
      <CategoryForm action={updateCategory.bind(null, category.id)} category={category} />
    </div>
  );
}
