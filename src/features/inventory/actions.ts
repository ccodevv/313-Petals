"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/features/authentication/queries";
import { stockAdjustmentSchema } from "@/lib/validations/inventory";

export type StockAdjustmentState = { error: string | null; success?: boolean };

export async function adjustStock(
  _prevState: StockAdjustmentState,
  formData: FormData,
): Promise<StockAdjustmentState> {
  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") return { error: "Not authorized" };

  const parsed = stockAdjustmentSchema.safeParse({
    productId: formData.get("productId"),
    changeQuantity: formData.get("changeQuantity"),
    reason: formData.get("reason"),
    note: formData.get("note") || undefined,
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.rpc("adjust_stock", {
    p_product_id: parsed.data.productId,
    p_change_quantity: parsed.data.changeQuantity,
    p_reason: parsed.data.reason,
    p_note: parsed.data.note ?? null,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  revalidatePath("/products");
  return { error: null, success: true };
}
