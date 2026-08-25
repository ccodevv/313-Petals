import { createClient } from "@/lib/supabase/server";
import { ADMIN_TABLE_PAGE_SIZE } from "@/config/constants";
import type { OrderStatus, PaymentStatus } from "@/config/constants";
import { sanitizeFilterValue } from "@/lib/utils/postgrest";
import type { Order, OrderWithItems, OrderWithItemsAndProfile, OrderWithProfile } from "@/types";

export async function getOrdersForCurrentUser(): Promise<Order[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getOrderById(orderId: string): Promise<OrderWithItems | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", orderId)
    .single();

  if (error) return null;
  return data;
}

export interface AdminOrderFilters {
  search?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  page?: number;
}

export async function getAllOrdersAdmin({
  search,
  status,
  paymentStatus,
  page = 1,
}: AdminOrderFilters): Promise<{ orders: OrderWithProfile[]; totalCount: number }> {
  const supabase = await createClient();

  let query = supabase
    .from("orders")
    .select("*, profile:profiles(id, full_name, email, phone)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (paymentStatus) query = query.eq("payment_status", paymentStatus);
  if (search) {
    const term = sanitizeFilterValue(search);
    query = query.or(
      `order_number.ilike.%${term}%,contact_name.ilike.%${term}%,contact_email.ilike.%${term}%`,
    );
  }

  const from = (page - 1) * ADMIN_TABLE_PAGE_SIZE;
  const to = from + ADMIN_TABLE_PAGE_SIZE - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;

  return { orders: data ?? [], totalCount: count ?? 0 };
}

export async function getOrderByIdAdmin(orderId: string): Promise<OrderWithItemsAndProfile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*), profile:profiles(id, full_name, email, phone, delivery_address)")
    .eq("id", orderId)
    .single();

  if (error) return null;
  return data;
}
