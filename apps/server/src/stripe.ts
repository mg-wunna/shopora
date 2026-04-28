import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;
  if (!stripeClient) {
    stripeClient = new Stripe(secretKey, { maxNetworkRetries: 2 });
  }
  return stripeClient;
}

export function getWebsiteUrl(): string {
  const raw =
    process.env.WEBSITE_URL ||
    process.env.PUBLIC_WEBSITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3001";
  return raw.replace(/\/+$/, "");
}
