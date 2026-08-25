import { z } from "zod";

export const stockAdjustmentSchema = z.object({
  productId: z.string().uuid("Choose a product"),
  changeQuantity: z.coerce.number().int().refine((n) => n !== 0, "Enter a non-zero amount"),
  reason: z.enum(["restock", "adjustment", "return"]),
  note: z.string().trim().optional(),
});
