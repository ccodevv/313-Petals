import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Enter a category name"),
  description: z.string().trim().optional(),
  isActive: z.coerce.boolean(),
});

export type CategoryInput = z.infer<typeof categorySchema>;
