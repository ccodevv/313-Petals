import type { Metadata } from "next";
import { ProductGrid } from "@/components/store/product-card";
import { ProductSearchBar } from "@/components/store/product-search-bar";
import { CategoryPills } from "@/components/store/category-pills";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { getProducts, type ProductSort } from "@/features/products/queries";
import { getActiveCategories } from "@/features/categories/queries";
import { PRODUCTS_PAGE_SIZE } from "@/config/constants";

export const metadata: Metadata = { title: "Shop" };

const VALID_SORTS: ProductSort[] = ["newest", "price_asc", "price_desc", "name_asc"];

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    category?: string;
    sort?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const sort = VALID_SORTS.includes(params.sort as ProductSort)
    ? (params.sort as ProductSort)
    : "newest";
  const page = Math.max(1, Number(params.page) || 1);

  const [{ products, totalCount }, categories] = await Promise.all([
    getProducts({
      search: params.search,
      categorySlug: params.category,
      sort,
      page,
    }),
    getActiveCategories(),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PRODUCTS_PAGE_SIZE));

  function buildHref(targetPage: number) {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.category) query.set("category", params.category);
    if (sort !== "newest") query.set("sort", sort);
    if (targetPage > 1) query.set("page", String(targetPage));
    const qs = query.toString();
    return qs ? `/products?${qs}` : "/products";
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold text-stone-900">Shop</h1>
      <p className="mt-1 text-stone-500">Fresh flowers for every occasion.</p>

      <div className="mt-6 space-y-4">
        <ProductSearchBar search={params.search} sort={sort} category={params.category} />
        <CategoryPills categories={categories} activeSlug={params.category} />
      </div>

      <div className="mt-8">
        {products.length === 0 ? (
          <EmptyState
            title="No products found"
            description="Try a different search term or category."
          />
        ) : (
          <>
            <ProductGrid products={products} />
            <div className="mt-10">
              <Pagination currentPage={page} totalPages={totalPages} buildHref={buildHref} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
