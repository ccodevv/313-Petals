"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { addToCart, type CartActionState } from "@/features/cart/actions";
import { Button, type Size } from "@/components/ui/button";

const initialState: CartActionState = { error: null };

export function AddToCartButton({
  productId,
  quantity = 1,
  disabled,
  size = "md",
  label = "Add to Cart",
}: {
  productId: string;
  quantity?: number;
  disabled?: boolean;
  size?: Size;
  label?: string;
}) {
  const [state, formAction, isPending] = useActionState(addToCart, initialState);
  const lastHandled = useRef(initialState);

  useEffect(() => {
    if (state === lastHandled.current) return;
    lastHandled.current = state;

    if (state.error) {
      toast.error(state.error);
    } else {
      toast.success("Added to cart");
    }
  }, [state]);

  return (
    <form action={formAction}>
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="quantity" value={quantity} />
      <Button type="submit" size={size} isLoading={isPending} disabled={disabled} className="w-full">
        {disabled ? "Out of Stock" : label}
      </Button>
    </form>
  );
}
