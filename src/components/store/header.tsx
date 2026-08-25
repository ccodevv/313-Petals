import Link from "next/link";
import { ShoppingBag, User } from "lucide-react";
import { siteConfig, storeNavLinks } from "@/config/site";
import { getCurrentProfile } from "@/features/authentication/queries";
import { getCartItemCount } from "@/features/cart/queries";
import { signOut } from "@/features/authentication/actions";
import { Button, buttonVariants } from "@/components/ui/button";

export async function StoreHeader() {
  const [profile, cartCount] = await Promise.all([
    getCurrentProfile(),
    getCartItemCount(),
  ]);

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight text-rose-700">
          {siteConfig.name}
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-stone-600 sm:flex">
          {storeNavLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-rose-700">
              {link.label}
            </Link>
          ))}
          {profile?.role === "admin" && (
            <Link href="/admin/dashboard" className="hover:text-rose-700">
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/cart"
            className="relative rounded-full p-2 text-stone-600 hover:bg-stone-100"
            aria-label="Cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-semibold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {profile ? (
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className="rounded-full p-2 text-stone-600 hover:bg-stone-100"
                aria-label="Profile"
              >
                <User className="h-5 w-5" />
              </Link>
              <form action={signOut}>
                <Button type="submit" variant="ghost" size="sm">
                  Sign out
                </Button>
              </form>
            </div>
          ) : (
            <Link href="/login" className={buttonVariants({ size: "sm" })}>
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
