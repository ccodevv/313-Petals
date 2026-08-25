import { z } from "zod";
import { FULFILLMENT_TYPES, PAYMENT_METHODS } from "@/config/constants";

export const checkoutSchema = z
  .object({
    contactName: z.string().trim().min(2, "Enter your full name"),
    contactPhone: z.string().trim().min(7, "Enter a valid contact number"),
    contactEmail: z.string().trim().email("Enter a valid email address"),
    fulfillmentType: z.enum(FULFILLMENT_TYPES),
    deliveryAddress: z.string().trim().optional(),
    preferredDatetime: z.string().trim().optional(),
    paymentMethod: z.enum(PAYMENT_METHODS),
    notes: z.string().trim().optional(),
  })
  .refine(
    (data) => data.fulfillmentType !== "delivery" || (data.deliveryAddress?.length ?? 0) > 0,
    { message: "Delivery address is required for delivery orders", path: ["deliveryAddress"] },
  );

export type CheckoutInput = z.infer<typeof checkoutSchema>;
