"use client";

import { useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toggleProductAvailability, deleteProduct } from "@/features/products/actions";
import type { Product } from "@/types";

export function ProductRowActions({ product }: { product: Product }) {
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleProductAvailability(product.id, !product.is_available);
      if (result?.error) toast.error(result.error);
    });
  }

  async function handleDelete() {
    const result = await deleteProduct(product.id);
    if (result?.error) toast.error(result.error);
    else toast.success("Product deleted");
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Link href={`/admin/products/${product.id}/edit`} className="text-sm font-medium text-rose-700 hover:underline">
        Edit
      </Link>
      <Button variant="outline" size="sm" onClick={handleToggle} isLoading={isPending}>
        {product.is_available ? "Deactivate" : "Activate"}
      </Button>
      <ConfirmDialog
        trigger={
          <Button variant="destructive" size="sm">
            Delete
          </Button>
        }
        title="Delete this product?"
        description={`"${product.name}" will be permanently removed. Past orders that include it are unaffected.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </div>
  );
}
