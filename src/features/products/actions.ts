"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/features/authentication/queries";
import { productSchema, slugify } from "@/lib/validations/product";

export type ProductFormState = { error: string | null };

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

async function uploadProductImage(supabase: Awaited<ReturnType<typeof createClient>>, file: File) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Image must be a JPEG, PNG, or WEBP file");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Image must be smaller than 5MB");
  }

  const ext = file.type.split("/")[1];
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from("product-images").upload(path, file);
  if (error) throw error;

  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}

function parseProductForm(formData: FormData) {
  return productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    price: formData.get("price"),
    categoryId: formData.get("categoryId") || "",
    stock: formData.get("stock"),
    lowStockThreshold: formData.get("lowStockThreshold"),
    isAvailable: formData.get("isAvailable") === "on",
  });
}

export async function createProduct(
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") return { error: "Not authorized" };

  const parsed = parseProductForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();

  let imageUrl: string | null = null;
  const imageFile = formData.get("image");
  if (imageFile instanceof File && imageFile.size > 0) {
    try {
      imageUrl = await uploadProductImage(supabase, imageFile);
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Image upload failed" };
    }
  }

  const { error } = await supabase.from("products").insert({
    name: parsed.data.name,
    slug: `${slugify(parsed.data.name)}-${Date.now().toString(36)}`,
    description: parsed.data.description ?? "",
    price: parsed.data.price,
    category_id: parsed.data.categoryId || null,
    stock: parsed.data.stock,
    low_stock_threshold: parsed.data.lowStockThreshold,
    is_available: parsed.data.isAvailable,
    image_url: imageUrl,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/products");
  revalidatePath("/products");
  redirect("/admin/products");
}

export async function updateProduct(
  productId: string,
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") return { error: "Not authorized" };

  const parsed = parseProductForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();

  let imageUrl: string | undefined;
  const imageFile = formData.get("image");
  if (imageFile instanceof File && imageFile.size > 0) {
    try {
      imageUrl = await uploadProductImage(supabase, imageFile);
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Image upload failed" };
    }
  }

  const { error } = await supabase
    .from("products")
    .update({
      name: parsed.data.name,
      description: parsed.data.description ?? "",
      price: parsed.data.price,
      category_id: parsed.data.categoryId || null,
      stock: parsed.data.stock,
      low_stock_threshold: parsed.data.lowStockThreshold,
      is_available: parsed.data.isAvailable,
      ...(imageUrl ? { image_url: imageUrl } : {}),
    })
    .eq("id", productId);

  if (error) return { error: error.message };

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath(`/admin/products/${productId}/edit`);
  redirect("/admin/products");
}

export async function toggleProductAvailability(productId: string, isAvailable: boolean) {
  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") return { error: "Not authorized" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ is_available: isAvailable })
    .eq("id", productId);

  if (error) return { error: error.message };

  revalidatePath("/admin/products");
  revalidatePath("/products");
  return { error: null };
}

export async function deleteProduct(productId: string) {
  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") return { error: "Not authorized" };

  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", productId);

  if (error) return { error: error.message };

  revalidatePath("/admin/products");
  revalidatePath("/products");
  return { error: null };
}
