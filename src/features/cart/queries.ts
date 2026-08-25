import { createClient } from "@/lib/supabase/server";
import type { CartItemWithProduct } from "@/types";

export async function getCartItemCount(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { data: cart } = await supabase
    .from("carts")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();
  if (!cart) return 0;

  const { data: items } = await supabase
    .from("cart_items")
    .select("quantity")
    .eq("cart_id", cart.id);

  return (items ?? []).reduce((sum, item) => sum + item.quantity, 0);
}

export async function getCartItems(): Promise<CartItemWithProduct[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: cart } = await supabase
    .from("carts")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();
  if (!cart) return [];

  const { data, error } = await supabase
    .from("cart_items")
    .select("*, product:products(*)")
    .eq("cart_id", cart.id)
    .order("created_at");

  if (error) throw error;
  return data;
}
