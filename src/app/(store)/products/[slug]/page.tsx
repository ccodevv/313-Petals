import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Flower2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { QuantityAddToCart } from "@/components/store/quantity-add-to-cart";
import { formatCurrency } from "@/lib/utils/format";
import { getProductBySlug } from "@/features/products/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return { title: product?.name ?? "Product" };
}

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const outOfStock = product.stock <= 0;
  const lowStock = !outOfStock && product.stock <= product.low_stock_threshold;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <nav className="mb-6 text-sm text-stone-500">
        <Link href="/products" className="hover:text-rose-700">
          Shop
        </Link>
        {product.category && (
          <>
            {" / "}
            <Link
              href={`/products?category=${product.category.slug}`}
              className="hover:text-rose-700"
            >
              {product.category.name}
            </Link>
          </>
        )}
        {" / "}
        <span className="text-stone-700">{product.name}</span>
      </nav>

      <div className="grid gap-10 sm:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-stone-100">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-stone-300">
              <Flower2 className="h-20 w-20" />
            </div>
          )}
        </div>

        <div>
          {product.category && (
            <span className="text-xs font-medium uppercase tracking-wide text-rose-600">
              {product.category.name}
            </span>
          )}
          <h1 className="mt-1 text-2xl font-semibold text-stone-900">{product.name}</h1>
          <p className="mt-2 text-2xl font-semibold text-rose-700">
            {formatCurrency(product.price)}
          </p>

          <div className="mt-3">
            {outOfStock && <Badge tone="danger">Out of stock</Badge>}
            {lowStock && <Badge tone="warning">Only {product.stock} left</Badge>}
            {!outOfStock && !lowStock && <Badge tone="success">In stock</Badge>}
          </div>

          <p className="mt-6 text-stone-600">{product.description}</p>

          <div className="mt-8">
            <QuantityAddToCart productId={product.id} stock={product.stock} />
          </div>
        </div>
      </div>
    </div>
  );
}
