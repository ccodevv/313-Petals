import Link from "next/link";
import { siteConfig } from "@/config/site";

export function StoreFooter() {
  return (
    <footer className="mt-auto border-t border-stone-200 bg-stone-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-stone-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="font-semibold text-stone-700">{siteConfig.name}</p>
          <p>{siteConfig.address}</p>
        </div>
        <div className="space-y-1">
          <p>{siteConfig.contactPhone}</p>
          <p>{siteConfig.contactEmail}</p>
        </div>
        <nav className="flex gap-4">
          <Link href="/products" className="hover:text-rose-700">
            Shop
          </Link>
          <Link href="/orders" className="hover:text-rose-700">
            My Orders
          </Link>
        </nav>
      </div>
      <div className="border-t border-stone-200 py-4 text-center text-xs text-stone-400">
        © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
      </div>
    </footer>
  );
}
