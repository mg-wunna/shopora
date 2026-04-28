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

function normalizeOrigin(origin: string | undefined | null): string | null {
  if (!origin) return null;
  try {
    const url = new URL(origin);
    return url.origin.replace(/\/+$/, "");
  } catch {
    return null;
  }
}

function configuredWebsiteOrigins(): Set<string> {
  const values = [
    process.env.WEBSITE_URL,
    process.env.PUBLIC_WEBSITE_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.CORS_ORIGINS,
  ];
  const origins = new Set<string>();
  for (const value of values) {
    if (!value) continue;
    for (const part of value.split(",")) {
      const origin = normalizeOrigin(part.trim());
      if (origin) origins.add(origin);
    }
  }
  return origins;
}

function isTrustedWebsiteOrigin(origin: string): boolean {
  const url = new URL(origin);
  if (process.env.NODE_ENV !== "production") {
    return url.hostname === "localhost" || url.hostname === "127.0.0.1";
  }
  if (configuredWebsiteOrigins().has(origin)) return true;
  return (
    url.protocol === "https:" &&
    (url.hostname === "shopora-website.pages.dev" ||
      url.hostname === "staging.shopora-website.pages.dev")
  );
}

export function getCheckoutReturnUrl(requestOrigin?: string | null): string {
  const origin = normalizeOrigin(requestOrigin);
  if (origin && isTrustedWebsiteOrigin(origin)) return origin;
  return getWebsiteUrl();
}

export function getStripeEnvironmentLabel(returnUrl: string): string {
  try {
    const hostname = new URL(returnUrl).hostname;
    if (hostname.startsWith("staging.")) return "staging";
    if (hostname === "localhost" || hostname === "127.0.0.1") return "local";
    return "production";
  } catch {
    return process.env.NODE_ENV === "production" ? "production" : "local";
  }
}
