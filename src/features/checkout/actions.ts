"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkoutSchema } from "@/lib/validations/checkout";
import { getCartItems } from "@/features/cart/queries";

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

  redirect(`/orders/${orderId}`);
}
