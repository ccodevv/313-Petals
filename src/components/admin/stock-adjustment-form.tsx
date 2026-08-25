"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { adjustStock, type StockAdjustmentState } from "@/features/inventory/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

const initialState: StockAdjustmentState = { error: null };

export function StockAdjustmentForm({
  products,
}: {
  products: { id: string; name: string; stock: number }[];
}) {
  const [state, formAction, isPending] = useActionState(adjustStock, initialState);
  const lastHandled = useRef(initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state === lastHandled.current) return;
    lastHandled.current = state;

    if (state.error) toast.error(state.error);
    else if (state.success) {
      toast.success("Stock updated");
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="grid gap-4 sm:grid-cols-5">
      <div className="sm:col-span-2">
        <Label htmlFor="productId">Product</Label>
        <Select id="productId" name="productId" required defaultValue="">
          <option value="" disabled>
            Select a product
          </option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name} ({product.stock} in stock)
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="changeQuantity">Amount (+/-)</Label>
        <Input id="changeQuantity" name="changeQuantity" type="number" placeholder="e.g. 10 or -2" required />
      </div>
      <div>
        <Label htmlFor="reason">Reason</Label>
        <Select id="reason" name="reason" defaultValue="restock">
          <option value="restock">Restock</option>
          <option value="adjustment">Adjustment</option>
          <option value="return">Return</option>
        </Select>
      </div>
      <div className="sm:col-span-5">
        <Label htmlFor="note">Note (optional)</Label>
        <Input id="note" name="note" placeholder="e.g. weekly delivery from supplier" />
      </div>
      <div className="sm:col-span-5">
        <Button type="submit" isLoading={isPending}>
          Apply adjustment
        </Button>
      </div>
    </form>
  );
}
