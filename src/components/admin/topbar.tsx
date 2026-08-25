import { signOut } from "@/features/authentication/actions";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/types";

const MOBILE_NAV = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/reports", label: "Reports" },
];

export function AdminTopbar({ profile }: { profile: Profile }) {
  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <nav className="flex gap-4 overflow-x-auto text-sm font-medium text-stone-600 sm:hidden">
          {MOBILE_NAV.map((item) => (
            <a key={item.href} href={item.href} className="shrink-0 hover:text-rose-700">
              {item.label}
            </a>
          ))}
        </nav>
        <div className="hidden sm:block" />
        <div className="flex items-center gap-3">
          <span className="text-sm text-stone-600">{profile.full_name || profile.email}</span>
          <form action={signOut}>
            <Button type="submit" variant="ghost" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
