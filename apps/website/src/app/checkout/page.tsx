"use client";

import Link from "next/link";
import { useState } from "react";
import type { Discount, Order, StripeCheckoutSession } from "@template/api";
import { useAuth, useCart, useToast } from "../../components/Providers";
import { api, formatPrice } from "../../lib/api";

const TEST_DEBIT_CARD = "4000 0566 5566 5556";

export default function CheckoutPage() {
  const { user } = useAuth();
  const { cart } = useCart();
  const toast = useToast();

  const [address, setAddress] = useState("123 Sample St, Apt 7\nBangkok 10110\nThailand");
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState<Discount | null>(null);
  const [validating, setValidating] = useState(false);
  const [stripePaying, setStripePaying] = useState(false);
  const [copiedCard, setCopiedCard] = useState(false);
  const [step, setStep] = useState<"shipping" | "payment">("shipping");
  const [order, setOrder] = useState<Order | null>(null);

  if (!user) {
    return (
      <div className="shell py-20 text-center">
        <h1 className="text-2xl font-bold">Sign in to check out</h1>
        <Link href="/login" className="btn-primary mt-6">
          Sign in
        </Link>
      </div>
    );
  }

  if (cart.items.length === 0 && !order) {
    return (
      <div className="shell py-20 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <Link href="/products" className="btn-primary mt-6">
          Browse products
        </Link>
      </div>
    );
  }

  const discountAmount = discount ? +(cart.subtotal * (discount.percentage / 100)).toFixed(2) : 0;
  const total = +(cart.subtotal - discountAmount).toFixed(2);

  async function applyCode() {
    if (!code.trim()) return;
    setValidating(true);
    try {
      const d = await api<Discount>("/discounts/validate", {
        method: "POST",
        body: { code: code.trim() },
      });
      setDiscount(d);
      toast.show(`Applied ${d.code} (${d.percentage}% off)`, "success");
    } catch (err) {
      toast.show(err instanceof Error ? err.message : "Invalid code", "error");
      setDiscount(null);
    } finally {
      setValidating(false);
    }
  }

  async function placeOrder() {
    if (!address.trim()) {
      toast.show("Add a shipping address", "error");
      return;
    }
    try {
      const created = await api<Order>("/orders", {
        method: "POST",
        body: {
          shippingAddress: address.trim(),
          discountCode: discount?.code,
        },
      });
      setOrder(created);
      setStep("payment");
    } catch (err) {
      toast.show(err instanceof Error ? err.message : "Could not create order", "error");
    }
  }

  async function payWithStripe() {
    if (!order) return;
    const checkoutTab = window.open("about:blank", "_blank");
    if (!checkoutTab) {
      toast.show("Allow pop-ups to open Stripe Checkout in a new tab.", "error");
      return;
    }
    checkoutTab.opener = null;
    setStripePaying(true);
    try {
      const session = await api<StripeCheckoutSession>("/payment/stripe-checkout", {
        method: "POST",
        body: { orderId: order.id },
      });
      checkoutTab.location.href = session.url;
      checkoutTab.focus();
    } catch (err) {
      checkoutTab.close();
      toast.show(err instanceof Error ? err.message : "Could not start Stripe Checkout", "error");
    } finally {
      setStripePaying(false);
    }
  }

  async function copyTestCard() {
    try {
      await navigator.clipboard.writeText(TEST_DEBIT_CARD);
      setCopiedCard(true);
      toast.show("Test debit card copied", "success");
      window.setTimeout(() => setCopiedCard(false), 1800);
    } catch {
      toast.show("Could not copy card number", "error");
    }
  }

  return (
    <div>
      <section className="commerce-hero">
        <div className="shell grid gap-6 py-8 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <div className="mono-label text-[var(--color-primary)]">Checkout</div>
            <h1 className="font-display mt-2 text-5xl font-bold leading-none">
              Complete your order
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Shipping is prefilled for demo speed. Stripe opens in a new tab and runs in test mode.
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Step n={1} label="Shipping" active={step === "shipping"} done={step === "payment"} />
            <div className="h-px w-10 bg-[var(--color-border)]" />
            <Step n={2} label="Payment" active={step === "payment"} />
          </div>
        </div>
      </section>

      <div className="shell grid gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div>
          {step === "shipping" ? (
            <Section title="Shipping details" eyebrow="Step 1">
              <label
                htmlFor="shipping-address"
                className="block text-xs font-semibold uppercase text-slate-400"
              >
                Address
              </label>
              <textarea
                id="shipping-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={4}
                placeholder="123 Sample St, Apt 7, City, Country"
                className="input mt-2 resize-none"
              />
              <label
                htmlFor="discount-code"
                className="mt-5 block text-xs font-semibold uppercase text-slate-400"
              >
                Discount code
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id="discount-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="WELCOME10"
                  className="input"
                />
                <button
                  type="button"
                  onClick={applyCode}
                  disabled={validating}
                  className="btn-secondary"
                >
                  {validating ? "Checking..." : "Apply"}
                </button>
              </div>
              {discount && (
                <div className="mt-2 text-xs font-semibold text-[var(--color-primary)]">
                  {discount.code} applied, {discount.percentage}% off
                </div>
              )}
              <button
                type="button"
                onClick={placeOrder}
                disabled={!address.trim() || cart.items.length === 0}
                className="btn-primary mt-6 w-full"
              >
                Continue to payment →
              </button>
            </Section>
          ) : (
            <Section title="Pay with Stripe" eyebrow="Step 2">
              <div className="grid gap-4 md:grid-cols-[1fr_0.85fr]">
                <div>
                  <p className="text-sm leading-6 text-slate-400">
                    Use the debit card below on Stripe Checkout. This is a test-mode payment and
                    will not move real money.
                  </p>
                  <button
                    type="button"
                    onClick={payWithStripe}
                    disabled={stripePaying}
                    className="btn-primary mt-5 w-full"
                  >
                    {stripePaying
                      ? "Opening Stripe..."
                      : `Open Stripe Checkout ${formatPrice(order?.totalAmount ?? total)}`}
                  </button>
                  <p className="mt-3 text-xs leading-5 text-slate-500">
                    Return to this tab after paying; the order page verifies the Stripe session.
                  </p>
                </div>
                <div className="rounded-lg border border-[rgba(11,107,86,0.22)] bg-[rgba(11,107,86,0.06)] p-4">
                  <div className="mono-label text-[var(--color-primary)]">Test debit card</div>
                  <div className="mt-3 flex items-center gap-2 rounded-md border border-white/10 bg-white p-2">
                    <span className="min-w-0 flex-1 px-1 font-mono text-base font-semibold text-[var(--color-text)] sm:text-lg">
                      {TEST_DEBIT_CARD}
                    </span>
                    <button
                      type="button"
                      onClick={copyTestCard}
                      className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-md border border-white/10 bg-[rgba(11,107,86,0.05)] text-[var(--color-primary)] transition hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white"
                      aria-label="Copy test debit card number"
                      title={copiedCard ? "Copied" : "Copy card number"}
                    >
                      {copiedCard ? (
                        <span className="text-[10px] font-bold uppercase text-[var(--color-primary)]">
                          OK
                        </span>
                      ) : (
                        <CopyIcon />
                      )}
                    </button>
                  </div>
                  <div className="mt-3 grid gap-2 text-xs text-slate-300">
                    <CardHint label="Expiry" value="Any future date" />
                    <CardHint label="CVC" value="Any 3 digits" />
                    <CardHint label="ZIP" value="Any valid ZIP" />
                  </div>
                </div>
              </div>
            </Section>
          )}
        </div>

        <aside className="commerce-panel h-fit p-5">
          <div className="mono-label text-slate-300">Summary</div>
          <ul className="mt-4 divide-y divide-white/5 rounded-lg border border-white/10 bg-white/72">
            {(order?.items ?? cart.items).map((it) => (
              <li key={it.productId} className="flex justify-between gap-3 p-3 text-sm">
                <span className="min-w-0 truncate text-slate-300">
                  {it.name} <span className="text-slate-500">×{it.quantity}</span>
                </span>
                <span className="font-semibold text-[var(--color-text)]">
                  {formatPrice(it.price * it.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 text-sm">
            <Row label="Subtotal" value={formatPrice(order?.subtotal ?? cart.subtotal)} />
            {(discount || order?.discountCode) && (
              <Row
                label={`Discount${(order?.discountCode ?? discount?.code) ? ` (${order?.discountCode ?? discount?.code})` : ""}`}
                value={`− ${formatPrice(order?.discountAmount ?? discountAmount)}`}
                positive
              />
            )}
            <div className="my-3 border-t border-white/10" />
            <Row label="Total" value={formatPrice(order?.totalAmount ?? total)} bold />
          </dl>
        </aside>
      </div>
    </div>
  );
}

function Section({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <section className="commerce-panel p-5 md:p-6">
      <div className="mono-label text-[var(--color-primary)]">{eyebrow}</div>
      <h2 className="font-display mt-2 text-3xl font-bold">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Step({
  n,
  label,
  active,
  done,
}: {
  n: number;
  label: string;
  active?: boolean;
  done?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${
          done
            ? "bg-[var(--color-primary)] text-white"
            : active
              ? "bg-[var(--color-text)] text-white"
              : "bg-white/5 text-slate-400"
        }`}
      >
        {done ? "✓" : n}
      </div>
      <span className={active || done ? "font-semibold" : "text-slate-400"}>{label}</span>
    </div>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        d="M8 8V6.5A2.5 2.5 0 0110.5 4h7A2.5 2.5 0 0120 6.5v7a2.5 2.5 0 01-2.5 2.5H16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <rect x="4" y="8" width="12" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function CardHint({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
  positive,
}: {
  label: string;
  value: string;
  bold?: boolean;
  positive?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-slate-400">{label}</dt>
      <dd
        className={`${bold ? "text-xl font-bold text-[var(--color-text)]" : positive ? "text-[var(--color-primary)]" : "text-slate-200"}`}
      >
        {value}
      </dd>
    </div>
  );
}
