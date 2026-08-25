import type { Database } from "./database.types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type CartItem = Database["public"]["Tables"]["cart_items"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];
export type InventoryTransaction =
  Database["public"]["Tables"]["inventory_transactions"]["Row"];

export type ProductWithCategory = Product & {
  category: Pick<Category, "id" | "name" | "slug"> | null;
};

export type CartItemWithProduct = CartItem & {
  product: Product | null;
};

export type OrderWithItems = Order & {
  order_items: OrderItem[];
};

export type OrderWithItemsAndProfile = Order & {
  order_items: OrderItem[];
  profile: Pick<Profile, "id" | "full_name" | "email" | "phone" | "delivery_address"> | null;
};

export type OrderWithProfile = Order & {
  profile: Pick<Profile, "id" | "full_name" | "email" | "phone"> | null;
};
