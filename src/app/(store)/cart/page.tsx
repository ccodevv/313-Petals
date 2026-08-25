import Link from "next/link";
import type { Metadata } from "next";
import { CartItemRow } from "@/components/store/cart-item-row";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/format";
import { getCartItems } from "@/features/cart/queries";

export const metadata: Metadata = { title: "Your Cart" };

export default async function CartPage() {
  const items = await getCartItems();

  const validItems = items.filter(
    (item) => item.product && item.product.is_available && item.quantity <= item.product.stock,
  );
  const subtotal = validItems.reduce(
    (sum, item) => sum + item.product!.price * item.quantity,
    0,
  );
  const canCheckout = items.length > 0 && validItems.length === items.length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold text-stone-900">Your Cart</h1>

      {items.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Your cart is empty"
            description="Browse our collection and add something lovely."
            action={
              <Link href="/products" className={buttonVariants()}>
                Continue shopping
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-8 sm:grid-cols-3">
          <div className="sm:col-span-2">
            {items.map((item) => (
              <CartItemRow key={item.id} item={item} />
            ))}
          </div>

          <div className="h-fit rounded-2xl border border-stone-200 p-5">
            <div className="flex justify-between text-sm text-stone-600">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="mt-2 flex justify-between text-base font-semibold text-stone-900">
              <span>Total</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>

            {!canCheckout && (
              <p className="mt-3 text-sm text-amber-600">
                Resolve the issues above before checking out.
              </p>
            )}

            {canCheckout ? (
              <Link href="/checkout" className={buttonVariants({ className: "mt-5 w-full" })}>
                Proceed to Checkout
              </Link>
            ) : (
              <span className={buttonVariants({ className: "mt-5 w-full opacity-50 pointer-events-none" })}>
                Proceed to Checkout
              </span>
            )}

            <Link
              href="/products"
              className="mt-3 block text-center text-sm font-medium text-stone-600 hover:text-rose-700"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
