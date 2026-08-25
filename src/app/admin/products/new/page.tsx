import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/product-form";
import { createProduct } from "@/features/products/actions";
import { getAllCategoriesAdmin } from "@/features/categories/queries";

export const metadata: Metadata = { title: "New Product" };

export default async function NewProductPage() {
  const categories = await getAllCategoriesAdmin();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-stone-900">New Product</h1>
      <ProductForm action={createProduct} categories={categories} />
    </div>
  );
}
