"use client";

import { useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Flower2, Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { updateCartItemQuantity, removeCartItem } from "@/features/cart/actions";
import { formatCurrency } from "@/lib/utils/format";
import type { CartItemWithProduct } from "@/types";

export function CartItemRow({ item }: { item: CartItemWithProduct }) {
  const [isPending, startTransition] = useTransition();
  const product = item.product;

  const unavailable = !product || !product.is_available;
  const exceedsStock = product ? item.quantity > product.stock : false;

  function handleQuantityChange(nextQuantity: number) {
    startTransition(async () => {
      const result = await updateCartItemQuantity(item.id, nextQuantity);
      if (result?.error) toast.error(result.error);
    });
  }

  function handleRemove() {
    startTransition(async () => {
      const result = await removeCartItem(item.id);
      if (result?.error) toast.error(result.error);
    });
  }

  return (
    <div className="flex gap-4 border-b border-stone-200 py-5 last:border-0">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-stone-100">
        {product?.image_url ? (
          <Image src={product.image_url} alt={product.name} fill className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-stone-300">
            <Flower2 className="h-6 w-6" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-4">
          <div>
            {product ? (
              <Link
                href={`/products/${product.slug}`}
                className="font-medium text-stone-900 hover:text-rose-700"
              >
                {product.name}
              </Link>
            ) : (
              <span className="font-medium text-stone-400">Product no longer available</span>
            )}
            {product && (
              <p className="text-sm text-stone-500">{formatCurrency(product.price)} each</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleRemove}
            disabled={isPending}
            className="p-1 text-stone-400 hover:text-red-600 disabled:opacity-50"
            aria-label="Remove item"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {unavailable ? (
          <p className="mt-2 text-sm text-red-600">
            No longer available - remove it to continue checkout.
          </p>
        ) : (
          <>
            {exceedsStock && (
              <p className="mt-2 text-sm text-amber-600">
                Only {product!.stock} left - please reduce the quantity.
              </p>
            )}
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center rounded-full border border-stone-300">
                <button
                  type="button"
                  className="p-1.5 text-stone-600 hover:text-rose-700 disabled:opacity-40"
                  onClick={() => handleQuantityChange(item.quantity - 1)}
                  disabled={isPending}
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                <button
                  type="button"
                  className="p-1.5 text-stone-600 hover:text-rose-700 disabled:opacity-40"
                  onClick={() => handleQuantityChange(item.quantity + 1)}
                  disabled={isPending || item.quantity >= product!.stock}
                  aria-label="Increase quantity"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <span className="font-medium text-stone-900">
                {formatCurrency(product!.price * item.quantity)}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
