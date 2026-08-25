"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/features/authentication/queries";
import type { OrderStatus, PaymentStatus } from "@/config/constants";

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") return { error: "Not authorized" };

  const supabase = await createClient();
  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
  if (error) return { error: error.message };

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath(`/orders/${orderId}`);
  return { error: null };
}

export async function updateOrderPaymentStatus(orderId: string, paymentStatus: PaymentStatus) {
  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") return { error: "Not authorized" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({ payment_status: paymentStatus })
    .eq("id", orderId);
  if (error) return { error: error.message };

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath(`/orders/${orderId}`);
  return { error: null };
}
