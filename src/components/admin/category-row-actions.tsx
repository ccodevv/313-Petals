"use client";

import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteCategory } from "@/features/categories/actions";
import type { Category } from "@/types";

export function CategoryRowActions({ category }: { category: Category }) {
  async function handleDelete() {
    const result = await deleteCategory(category.id);
    if (result?.error) toast.error(result.error);
    else toast.success("Category deleted");
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Link
        href={`/admin/products?category=${category.id}`}
        className="text-sm font-medium text-stone-600 hover:text-rose-700 hover:underline"
      >
        View products
      </Link>
      <Link
        href={`/admin/categories/${category.id}/edit`}
        className="text-sm font-medium text-rose-700 hover:underline"
      >
        Edit
      </Link>
      <ConfirmDialog
        trigger={
          <Button variant="destructive" size="sm">
            Delete
          </Button>
        }
        title="Delete this category?"
        description={`"${category.name}" will be removed. Products in it become uncategorized.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </div>
  );
}
