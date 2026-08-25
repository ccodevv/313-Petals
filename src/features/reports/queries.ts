import { createClient } from "@/lib/supabase/server";
import { DEFAULT_LOW_STOCK_THRESHOLD } from "@/config/constants";
import type { OrderWithProfile } from "@/types";

export interface DashboardStats {
  totalSales: number;
  todaySales: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  lowStockCount: number;
  recentOrders: OrderWithProfile[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [
    { data: paidOrders },
    { data: todayPaidOrders },
    { count: totalOrders },
    { count: pendingOrders },
    { count: completedOrders },
    { data: products },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from("orders").select("total").eq("payment_status", "paid"),
    supabase
      .from("orders")
      .select("total")
      .eq("payment_status", "paid")
      .gte("created_at", startOfToday.toISOString()),
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "completed"),
    supabase.from("products").select("stock, low_stock_threshold"),
    supabase
      .from("orders")
      .select("*, profile:profiles(id, full_name, email, phone)")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const lowStockCount = (products ?? []).filter(
    (p) => p.stock <= (p.low_stock_threshold ?? DEFAULT_LOW_STOCK_THRESHOLD),
  ).length;

  return {
    totalSales: (paidOrders ?? []).reduce((sum, o) => sum + o.total, 0),
    todaySales: (todayPaidOrders ?? []).reduce((sum, o) => sum + o.total, 0),
    totalOrders: totalOrders ?? 0,
    pendingOrders: pendingOrders ?? 0,
    completedOrders: completedOrders ?? 0,
    lowStockCount,
    recentOrders: recentOrders ?? [],
  };
}
