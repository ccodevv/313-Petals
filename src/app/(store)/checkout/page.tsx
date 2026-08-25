import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { CheckoutForm } from "./checkout-form";
import { formatCurrency } from "@/lib/utils/format";
import { requireProfile } from "@/features/authentication/queries";
import { getCartItems } from "@/features/cart/queries";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const profile = await requireProfile("/checkout");
  const items = await getCartItems();

  const validItems = items.filter(
    (item) => item.product && item.product.is_available && item.quantity <= item.product.stock,
  );

  if (items.length === 0 || validItems.length !== items.length) {
    redirect("/cart");
  }

  const subtotal = validItems.reduce(
    (sum, item) => sum + item.product!.price * item.quantity,
    0,
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold text-stone-900">Checkout</h1>

      <div className="mt-8 grid gap-10 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <CheckoutForm profile={profile} />
        </div>

        <div className="h-fit space-y-4 rounded-2xl border border-stone-200 p-5">
          <h2 className="text-base font-semibold text-stone-900">Order Summary</h2>
          <ul className="space-y-2 text-sm">
            {validItems.map((item) => (
              <li key={item.id} className="flex justify-between text-stone-600">
                <span>
                  {item.product!.name} × {item.quantity}
                </span>
                <span>{formatCurrency(item.product!.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between border-t border-stone-200 pt-3 text-base font-semibold text-stone-900">
            <span>Total</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
