"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type CartActionState = { error: string | null };

async function getOrCreateCartId(userId: string) {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("carts")
    .select("id")
    .eq("profile_id", userId)
    .maybeSingle();
  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from("carts")
    .insert({ profile_id: userId })
    .select("id")
    .single();
  if (error) throw error;
  return created.id;
}

export async function addToCart(
  _prevState: CartActionState,
  formData: FormData,
): Promise<CartActionState> {
  const productId = formData.get("productId");
  const quantity = Number(formData.get("quantity") ?? 1);

  if (typeof productId !== "string" || !Number.isFinite(quantity) || quantity < 1) {
    return { error: "Invalid request" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?redirectTo=${encodeURIComponent("/products")}`);
  }

  const { data: product } = await supabase
    .from("products")
    .select("stock, is_available")
    .eq("id", productId)
    .single();

  if (!product || !product.is_available) {
    return { error: "This product is no longer available" };
  }

  const cartId = await getOrCreateCartId(user.id);

  const { data: existingItem } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("cart_id", cartId)
    .eq("product_id", productId)
    .maybeSingle();

  const desiredQuantity = (existingItem?.quantity ?? 0) + quantity;
  if (desiredQuantity > product.stock) {
    return {
      error: `Only ${product.stock} left in stock`,
    };
  }

  if (existingItem) {
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: desiredQuantity })
      .eq("id", existingItem.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("cart_items")
      .insert({ cart_id: cartId, product_id: productId, quantity });
    if (error) return { error: error.message };
  }

  revalidatePath("/cart");
  revalidatePath("/", "layout");
  return { error: null };
}

export async function updateCartItemQuantity(itemId: string, quantity: number) {
  const supabase = await createClient();

  if (quantity < 1) {
    return removeCartItem(itemId);
  }

  const { data: item } = await supabase
    .from("cart_items")
    .select("product_id")
    .eq("id", itemId)
    .single();
  if (!item) return { error: "Item not found" };

  const { data: product } = await supabase
    .from("products")
    .select("stock, is_available")
    .eq("id", item.product_id)
    .single();

  if (!product || !product.is_available) {
    await removeCartItem(itemId);
    revalidatePath("/cart");
    return { error: "This product is no longer available and was removed from your cart" };
  }

  if (quantity > product.stock) {
    return { error: `Only ${product.stock} left in stock` };
  }

  const { error } = await supabase
    .from("cart_items")
    .update({ quantity })
    .eq("id", itemId);
  if (error) return { error: error.message };

  revalidatePath("/cart");
  revalidatePath("/", "layout");
  return { error: null };
}

export async function removeCartItem(itemId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("cart_items").delete().eq("id", itemId);
  if (error) return { error: error.message };

  revalidatePath("/cart");
  revalidatePath("/", "layout");
  return { error: null };
}
