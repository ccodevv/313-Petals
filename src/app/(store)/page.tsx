import Link from "next/link";
import { Flower2 } from "lucide-react";
import { siteConfig } from "@/config/site";
import { buttonVariants } from "@/components/ui/button";
import { ProductGrid } from "@/components/store/product-card";
import { getFeaturedProducts } from "@/features/products/queries";
import { getActiveCategories } from "@/features/categories/queries";

export default async function HomePage() {
  const [featuredProducts, categories] = await Promise.all([
    getFeaturedProducts(8),
    getActiveCategories(),
  ]);

  return (
    <div>
      <section className="bg-gradient-to-b from-rose-50 to-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-20 text-center sm:px-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-4 py-1.5 text-sm font-medium text-rose-700">
            <Flower2 className="h-4 w-4" /> Fresh flowers, hand-arranged daily
          </span>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
            {siteConfig.name}
          </h1>
          <p className="max-w-xl text-lg text-stone-600">{siteConfig.description}</p>
          <Link href="/products" className={buttonVariants({ size: "lg" })}>
            Shop the collection
          </Link>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <h2 className="text-xl font-semibold text-stone-900">Shop by category</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-6 text-center font-medium text-stone-700 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {featuredProducts.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-stone-900">Popular right now</h2>
            <Link href="/products" className="text-sm font-medium text-rose-700 hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-4">
            <ProductGrid products={featuredProducts} />
          </div>
        </section>
      )}
    </div>
  );
}
