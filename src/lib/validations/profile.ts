import { z } from "zod";

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name"),
  phone: z.string().trim().optional(),
  deliveryAddress: z.string().trim().optional(),
});
