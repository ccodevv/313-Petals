import { createClient } from "@/lib/supabase/server";
import { PRODUCTS_PAGE_SIZE } from "@/config/constants";
import type { ProductWithCategory } from "@/types";

export type ProductSort = "newest" | "price_asc" | "price_desc" | "name_asc";

export interface ProductFilters {
  search?: string;
  categorySlug?: string;
  sort?: ProductSort;
  page?: number;
}

const PRODUCT_SELECT = "*, category:categories(id, name, slug)";

export async function getProducts({
  search,
  categorySlug,
  sort = "newest",
  page = 1,
}: ProductFilters): Promise<{ products: ProductWithCategory[]; totalCount: number }> {
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT, { count: "exact" })
    .eq("is_available", true);

  if (categorySlug) {
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .single();
    query = query.eq("category_id", category?.id ?? "00000000-0000-0000-0000-000000000000");
  }

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  switch (sort) {
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    case "name_asc":
      query = query.order("name", { ascending: true });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const from = (page - 1) * PRODUCTS_PAGE_SIZE;
  const to = from + PRODUCTS_PAGE_SIZE - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;

  return { products: data ?? [], totalCount: count ?? 0 };
}

export async function getProductBySlug(slug: string): Promise<ProductWithCategory | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data;
}

export async function getFeaturedProducts(limit = 4): Promise<ProductWithCategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_available", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}
