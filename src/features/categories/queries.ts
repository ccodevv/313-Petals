import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/types";

export async function getActiveCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) throw error;
  return data;
}

/** All categories, active or not - for admin screens (a product already
 * assigned to a deactivated category should still show it in the form). */
export async function getAllCategoriesAdmin(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").select("*").order("name");

  if (error) throw error;
  return data;
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").select("*").eq("id", id).single();

  if (error) return null;
  return data;
}
