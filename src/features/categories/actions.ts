"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/features/authentication/queries";
import { categorySchema } from "@/lib/validations/category";
import { slugify } from "@/lib/validations/product";

export type CategoryFormState = { error: string | null };

function parseCategoryForm(formData: FormData) {
  return categorySchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    isActive: formData.get("isActive") === "on",
  });
}

export async function createCategory(
  _prevState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") return { error: "Not authorized" };

  const parsed = parseCategoryForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.from("categories").insert({
    name: parsed.data.name,
    slug: `${slugify(parsed.data.name)}-${Date.now().toString(36)}`,
    description: parsed.data.description ?? null,
    is_active: parsed.data.isActive,
  });

  if (error) {
    return { error: error.code === "23505" ? "A category with this name already exists" : error.message };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/products");
  redirect("/admin/categories");
}

export async function updateCategory(
  categoryId: string,
  _prevState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") return { error: "Not authorized" };

  const parsed = parseCategoryForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      is_active: parsed.data.isActive,
    })
    .eq("id", categoryId);

  if (error) {
    return { error: error.code === "23505" ? "A category with this name already exists" : error.message };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/products");
  redirect("/admin/categories");
}

export async function deleteCategory(categoryId: string) {
  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") return { error: "Not authorized" };

  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", categoryId);

  if (error) return { error: error.message };

  revalidatePath("/admin/categories");
  revalidatePath("/products");
  return { error: null };
}
