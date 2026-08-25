import { createClient } from "@/lib/supabase/server";
import { DEFAULT_LOW_STOCK_THRESHOLD } from "@/config/constants";
import type { Product } from "@/types";

export interface InventoryTransactionWithProduct {
  id: string;
  change_quantity: number;
  reason: string;
  note: string | null;
  created_at: string;
  product: Pick<Product, "id" | "name"> | null;
}

export async function getLowStockProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("stock", { ascending: true });

  if (error) throw error;
  return (data ?? []).filter(
    (p) => p.stock <= (p.low_stock_threshold ?? DEFAULT_LOW_STOCK_THRESHOLD),
  );
}

export async function getAllProductsForInventory(): Promise<Pick<Product, "id" | "name" | "stock">[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, stock")
    .order("name");

  if (error) throw error;
  return data ?? [];
}

export async function getRecentInventoryTransactions(
  limit = 30,
): Promise<InventoryTransactionWithProduct[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inventory_transactions")
    .select("id, change_quantity, reason, note, created_at, product:products(id, name)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}
