import "server-only";
import Stripe from "stripe";

let stripeClient: Stripe | null = null;

/**
 * Lazily constructed so importing this module never fails on its own -
 * only picking "Card" at checkout (or a webhook request) actually needs a
 * configured Stripe key. That keeps cash/GCash/bank-transfer checkout
 * working even in an environment that hasn't set up Stripe yet.
 */
export function getStripeClient(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeClient;
}
