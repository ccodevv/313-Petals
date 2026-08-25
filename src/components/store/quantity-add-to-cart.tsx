"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { addToCart, type CartActionState } from "@/features/cart/actions";
import { Button } from "@/components/ui/button";

const initialState: CartActionState = { error: null };

export function QuantityAddToCart({ productId, stock }: { productId: string; stock: number }) {
  const [quantity, setQuantity] = useState(1);
  const [state, formAction, isPending] = useActionState(addToCart, initialState);
  const lastHandled = useRef(initialState);

  useEffect(() => {
    if (state === lastHandled.current) return;
    lastHandled.current = state;

    if (state.error) {
      toast.error(state.error);
    } else {
      toast.success(`Added ${quantity} to cart`);
    }
    // quantity intentionally omitted: we only want this to react to state changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  if (stock <= 0) {
    return (
      <Button disabled className="w-full">
        Out of Stock
      </Button>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="quantity" value={quantity} />

      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-stone-700">Quantity</span>
        <div className="flex items-center rounded-full border border-stone-300">
          <button
            type="button"
            className="p-2 text-stone-600 hover:text-rose-700 disabled:opacity-40"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center text-sm font-medium">{quantity}</span>
          <button
            type="button"
            className="p-2 text-stone-600 hover:text-rose-700 disabled:opacity-40"
            onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
            disabled={quantity >= stock}
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <span className="text-sm text-stone-500">{stock} available</span>
      </div>

      <Button type="submit" isLoading={isPending} className="w-full" size="lg">
        Add to Cart
      </Button>
    </form>
  );
}
