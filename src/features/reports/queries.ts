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

export interface SalesBucket {
  label: string;
  total: number;
}

export interface BestSellingProduct {
  productName: string;
  quantitySold: number;
  revenue: number;
}

export interface SalesReport {
  dailySales: SalesBucket[];
  weeklySales: SalesBucket[];
  monthlySales: SalesBucket[];
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  bestSellers: BestSellingProduct[];
  lowStockCount: number;
}

/** "Sales" here means paid orders - cancelled or unpaid orders don't count
 * as revenue. Bucketing is done in memory rather than with a bespoke SQL
 * function: at small-business order volumes this is simple and plenty
 * fast, and it keeps all three time granularities consistent with each
 * other (same underlying rows). */
export async function getSalesReport(): Promise<SalesReport> {
  const supabase = await createClient();
  const since = new Date();
  since.setDate(since.getDate() - 180);

  const [
    { data: paidOrders },
    { count: totalOrders },
    { count: completedOrders },
    { count: cancelledOrders },
    { data: soldItems },
    { data: products },
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("total, created_at")
      .eq("payment_status", "paid")
      .gte("created_at", since.toISOString()),
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "completed"),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "cancelled"),
    supabase
      .from("order_items")
      .select("product_name, quantity, line_total, orders!inner(status, created_at)")
      .neq("orders.status", "cancelled")
      .gte("orders.created_at", since.toISOString()),
    supabase.from("products").select("stock, low_stock_threshold"),
  ]);

  const bestSellerMap = new Map<string, BestSellingProduct>();
  for (const item of soldItems ?? []) {
    const existing = bestSellerMap.get(item.product_name);
    if (existing) {
      existing.quantitySold += item.quantity;
      existing.revenue += item.line_total;
    } else {
      bestSellerMap.set(item.product_name, {
        productName: item.product_name,
        quantitySold: item.quantity,
        revenue: item.line_total,
      });
    }
  }
  const bestSellers = [...bestSellerMap.values()]
    .sort((a, b) => b.quantitySold - a.quantitySold)
    .slice(0, 10);

  const lowStockCount = (products ?? []).filter(
    (p) => p.stock <= (p.low_stock_threshold ?? DEFAULT_LOW_STOCK_THRESHOLD),
  ).length;

  return {
    dailySales: bucketByDay(paidOrders ?? [], 14),
    weeklySales: bucketByWeek(paidOrders ?? [], 8),
    monthlySales: bucketByMonth(paidOrders ?? [], 6),
    totalOrders: totalOrders ?? 0,
    completedOrders: completedOrders ?? 0,
    cancelledOrders: cancelledOrders ?? 0,
    bestSellers,
    lowStockCount,
  };
}

type SoldOrder = { total: number; created_at: string };

function bucketByDay(orders: SoldOrder[], days: number): SalesBucket[] {
  const buckets: SalesBucket[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - i);
    const next = new Date(day);
    next.setDate(next.getDate() + 1);

    const total = orders
      .filter((o) => {
        const created = new Date(o.created_at);
        return created >= day && created < next;
      })
      .reduce((sum, o) => sum + o.total, 0);

    buckets.push({
      label: day.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      total,
    });
  }
  return buckets;
}

function bucketByWeek(orders: SoldOrder[], weeks: number): SalesBucket[] {
  const buckets: SalesBucket[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - start.getDay() - i * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    const total = orders
      .filter((o) => {
        const created = new Date(o.created_at);
        return created >= start && created < end;
      })
      .reduce((sum, o) => sum + o.total, 0);

    buckets.push({
      label: start.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      total,
    });
  }
  return buckets;
}

function bucketByMonth(orders: SoldOrder[], months: number): SalesBucket[] {
  const buckets: SalesBucket[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

    const total = orders
      .filter((o) => {
        const created = new Date(o.created_at);
        return created >= start && created < end;
      })
      .reduce((sum, o) => sum + o.total, 0);

    buckets.push({
      label: start.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      total,
    });
  }
  return buckets;
}
