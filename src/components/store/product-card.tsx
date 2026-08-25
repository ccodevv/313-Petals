import Image from "next/image";
import Link from "next/link";
import { Flower2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { formatCurrency } from "@/lib/utils/format";
import type { ProductWithCategory } from "@/types";

export function ProductCard({ product }: { product: ProductWithCategory }) {
  const outOfStock = product.stock <= 0;
  const lowStock = !outOfStock && product.stock <= product.low_stock_threshold;

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white transition-shadow hover:shadow-md">
      <Link href={`/products/${product.slug}`} className="relative block aspect-square bg-stone-100">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-stone-300">
            <Flower2 className="h-12 w-12" />
          </div>
        )}
        {outOfStock && (
          <span className="absolute left-3 top-3">
            <Badge tone="danger">Out of stock</Badge>
          </span>
        )}
        {lowStock && (
          <span className="absolute left-3 top-3">
            <Badge tone="warning">Only {product.stock} left</Badge>
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        {product.category && (
          <span className="text-xs font-medium uppercase tracking-wide text-rose-600">
            {product.category.name}
          </span>
        )}
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-medium text-stone-900 hover:text-rose-700">{product.name}</h3>
        </Link>
        <p className="mt-auto text-lg font-semibold text-stone-900">
          {formatCurrency(product.price)}
        </p>
        <AddToCartButton productId={product.id} disabled={outOfStock} size="sm" />
      </div>
    </div>
  );
}

export function ProductGrid({ products }: { products: ProductWithCategory[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
