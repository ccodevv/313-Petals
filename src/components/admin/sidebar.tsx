"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  Users,
  Boxes,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { siteConfig } from "@/config/site";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 border-r border-stone-200 bg-stone-50 sm:block">
      <div className="px-5 py-5">
        <Link href="/admin/dashboard" className="text-lg font-semibold text-rose-700">
          {siteConfig.name}
        </Link>
        <p className="text-xs text-stone-400">Admin</p>
      </div>
      <nav className="space-y-1 px-3">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-rose-600 text-white"
                  : "text-stone-600 hover:bg-stone-100 hover:text-stone-900",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-6 border-t border-stone-200 px-3 pt-4">
        <Link
          href="/"
          className="block rounded-lg px-3 py-2 text-sm font-medium text-stone-500 hover:bg-stone-100"
        >
          ← Back to shop
        </Link>
      </div>
    </aside>
  );
}
