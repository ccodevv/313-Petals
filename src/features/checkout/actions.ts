"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStripeClient } from "@/lib/stripe/server";
import { getSiteUrl } from "@/lib/utils/site-url";
import { checkoutSchema } from "@/lib/validations/checkout";
import { getCartItems } from "@/features/cart/queries";
import type { CartItemWithProduct } from "@/types";

export type CheckoutActionState = { error: string | null };

export async function placeOrder(
  _prevState: CheckoutActionState,
  formData: FormData,
): Promise<CheckoutActionState> {
  const parsed = checkoutSchema.safeParse({
    contactName: formData.get("contactName"),
    contactPhone: formData.get("contactPhone"),
    contactEmail: formData.get("contactEmail"),
    fulfillmentType: formData.get("fulfillmentType"),
    deliveryAddress: formData.get("deliveryAddress") || undefined,
    preferredDatetime: formData.get("preferredDatetime") || undefined,
    paymentMethod: formData.get("paymentMethod"),
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // Build the order from the user's actual cart server-side rather than
  // trusting a client-submitted item list - create_order() re-validates
  // stock regardless, but this keeps the order contents honest.
  const cartItems = await getCartItems();
  const validItems = cartItems.filter(
    (item) => item.product && item.product.is_available && item.quantity <= item.product.stock,
  );

  if (validItems.length === 0) {
    return { error: "Your cart is empty or contains unavailable items" };
  }

  const supabase = await createClient();
  const { data: orderId, error } = await supabase.rpc("create_order", {
    p_contact_name: parsed.data.contactName,
    p_contact_phone: parsed.data.contactPhone,
    p_contact_email: parsed.data.contactEmail,
    p_fulfillment_type: parsed.data.fulfillmentType,
    p_delivery_address: parsed.data.deliveryAddress ?? null,
    p_preferred_datetime: parsed.data.preferredDatetime
      ? new Date(parsed.data.preferredDatetime).toISOString()
      : null,
    p_payment_method: parsed.data.paymentMethod,
    p_notes: parsed.data.notes ?? null,
    p_items: validItems.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
    })),
  });

  if (error) {
    return { error: error.message };
  }

  if (parsed.data.paymentMethod === "card") {
    let checkoutUrl: string;
    try {
      checkoutUrl = await createStripeCheckoutUrl(orderId, validItems);
    } catch {
      // The order already exists (status: pending, payment_status: unpaid) -
      // send the customer to it instead of a hard crash. They (or an admin)
      // can retry payment or arrange it another way from there.
      redirect(`/orders/${orderId}?paymentError=1`);
    }
    redirect(checkoutUrl);
  }

  redirect(`/orders/${orderId}`);
}

/**
 * Stripe Checkout is hosted by Stripe - it collects the card details
 * itself, so no card data ever touches this app (or needs PCI handling
 * here). The order is already created and stock already reserved at this
 * point, same as for the other payment methods; the Stripe webhook
 * (src/app/api/webhooks/stripe/route.ts) marks it paid once payment
 * actually completes.
 */
async function createStripeCheckoutUrl(orderId: string, items: CartItemWithProduct[]) {
  const siteUrl = getSiteUrl();

  const session = await getStripeClient().checkout.sessions.create({
    mode: "payment",
    line_items: items.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: "usd",
        unit_amount: Math.round(item.product!.price * 100),
        product_data: { name: item.product!.name },
      },
    })),
    metadata: { order_id: orderId },
    success_url: `${siteUrl}/orders/${orderId}`,
    cancel_url: `${siteUrl}/checkout`,
  });

  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL");
  }
  return session.url;
}
