import { createClient } from "@/lib/supabase/server";
import { ADMIN_TABLE_PAGE_SIZE } from "@/config/constants";
import { sanitizeFilterValue } from "@/lib/utils/postgrest";
import type { Order } from "@/types";
import type { Database } from "@/types/database.types";

type CustomerSummary = Database["public"]["Views"]["customer_summary"]["Row"];

export async function getCustomersAdmin({
  search,
  page = 1,
}: {
  search?: string;
  page?: number;
}): Promise<{ customers: CustomerSummary[]; totalCount: number }> {
  const supabase = await createClient();

  let query = supabase
    .from("customer_summary")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (search) {
    const term = sanitizeFilterValue(search);
    query = query.or(`full_name.ilike.%${term}%,email.ilike.%${term}%`);
  }

  const from = (page - 1) * ADMIN_TABLE_PAGE_SIZE;
  const to = from + ADMIN_TABLE_PAGE_SIZE - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;

  return { customers: data ?? [], totalCount: count ?? 0 };
}

export async function getCustomerById(id: string): Promise<CustomerSummary | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customer_summary")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

export async function getOrdersForCustomer(profileId: string): Promise<Order[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
