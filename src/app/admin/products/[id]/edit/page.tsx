import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/product-form";
import { updateProduct } from "@/features/products/actions";
import { getProductByIdAdmin } from "@/features/products/queries";
import { getAllCategoriesAdmin } from "@/features/categories/queries";

export const metadata: Metadata = { title: "Edit Product" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProductByIdAdmin(id),
    getAllCategoriesAdmin(),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-stone-900">Edit Product</h1>
      <ProductForm
        action={updateProduct.bind(null, product.id)}
        categories={categories}
        product={product}
      />
    </div>
  );
}
