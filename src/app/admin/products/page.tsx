import Link from "next/link";
import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { ProductRowActions } from "@/components/admin/product-row-actions";
import { formatCurrency } from "@/lib/utils/format";
import { getAllProductsAdmin } from "@/features/products/queries";
import { ADMIN_TABLE_PAGE_SIZE } from "@/config/constants";

export const metadata: Metadata = { title: "Products" };

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const { products, totalCount } = await getAllProductsAdmin({
    search: params.search,
    categoryId: params.category,
    page,
  });
  const totalPages = Math.max(1, Math.ceil(totalCount / ADMIN_TABLE_PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-stone-900">Products</h1>
        <Link href="/admin/products/new" className={buttonVariants({ size: "sm" })}>
          <Plus className="h-4 w-4" /> New Product
        </Link>
      </div>

      <form method="get" className="max-w-sm">
        {params.category && <input type="hidden" name="category" value={params.category} />}
        <input
          type="search"
          name="search"
          placeholder="Search products..."
          defaultValue={params.search}
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
        />
      </form>

      {products.length === 0 ? (
        <EmptyState title="No products found" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="text-stone-500">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Stock</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-stone-50">
                  <td className="px-5 py-3 font-medium text-stone-900">{product.name}</td>
                  <td className="px-5 py-3 text-stone-600">{product.category?.name ?? "—"}</td>
                  <td className="px-5 py-3 text-stone-600">{formatCurrency(product.price)}</td>
                  <td className="px-5 py-3 text-stone-600">
                    {product.stock}
                    {product.stock <= product.low_stock_threshold && (
                      <Badge tone="warning" className="ml-2">
                        Low
                      </Badge>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={product.is_available ? "success" : "neutral"}>
                      {product.is_available ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    <ProductRowActions product={product} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        buildHref={(p) => {
          const query = new URLSearchParams();
          if (params.search) query.set("search", params.search);
          if (params.category) query.set("category", params.category);
          if (p > 1) query.set("page", String(p));
          const qs = query.toString();
          return qs ? `/admin/products?${qs}` : "/admin/products";
        }}
      />
    </div>
  );
}
