export const siteConfig = {
  name: "Petals & Stems",
  description:
    "A small-batch flower shop offering fresh bouquets, arrangements, and gifts for every occasion.",
  contactEmail: "hello@petalsandstems.example",
  contactPhone: "+1 (555) 010-2024",
  address: "123 Blossom Ave, Riverside",
} as const;

export const storeNavLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/orders", label: "My Orders" },
] as const;

export const adminNavLinks = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/reports", label: "Reports" },
] as const;
