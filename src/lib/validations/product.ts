import { z } from "zod";

export const productSchema = z.object({
  name: z.string().trim().min(2, "Enter a product name"),
  description: z.string().trim().optional(),
  price: z.coerce.number().min(0, "Price must be zero or more"),
  categoryId: z.string().uuid().optional().or(z.literal("")),
  stock: z.coerce.number().int().min(0, "Stock must be zero or more"),
  lowStockThreshold: z.coerce.number().int().min(0, "Must be zero or more"),
  isAvailable: z.coerce.boolean(),
});

export type ProductInput = z.infer<typeof productSchema>;

export function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
