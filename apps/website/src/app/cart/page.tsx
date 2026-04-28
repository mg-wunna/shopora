"use client";

import Link from "next/link";
import { useAuth, useCart } from "../../components/Providers";
import { formatPrice } from "../../lib/api";

export default function CartPage() {
  const { cart, remove, clear, add } = useCart();
  const { user } = useAuth();

  if (!user) {
    return (
      <EmptyState
        title="Sign in to view your cart"
        body="Your cart is tied to your account so it follows you across devices."
        cta={{ href: "/login", label: "Sign in" }}
      />
    );
  }

  if (cart.items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        body="Start shopping to add something worth checking out."
        cta={{ href: "/products", label: "Browse products" }}
      />
    );
  }

  return (
    <div>
      <section className="commerce-hero">
        <div className="shell grid gap-5 py-8 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <div className="mono-label text-[var(--color-primary)]">Cart</div>
            <h1 className="font-display mt-2 text-5xl font-bold leading-none">Review your cart</h1>
            <p className="mt-3 text-sm text-slate-400">
              {cart.items.length} item{cart.items.length === 1 ? "" : "s"} ready for Stripe test
              checkout.
            </p>
          </div>
          <button type="button" onClick={() => clear()} className="btn-secondary w-fit">
            Clear cart
          </button>
        </div>
      </section>

      <div className="shell grid gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="commerce-panel h-fit overflow-hidden">
          <div className="divide-y divide-white/5">
            {cart.items.map((it) => (
              <div key={it.productId} className="grid gap-4 p-4 md:grid-cols-[96px_1fr_auto]">
                <Link
                  href={`/product/?id=${it.productId}`}
                  className="h-24 w-24 overflow-hidden rounded-md border border-white/10 bg-white"
                >
                  <img src={it.image} alt={it.name} className="h-full w-full object-cover" />
                </Link>
                <div className="min-w-0">
                  <Link
                    href={`/product/?id=${it.productId}`}
                    className="block truncate text-base font-semibold hover:text-[var(--color-primary)]"
                  >
                    {it.name}
                  </Link>
                  <div className="mt-1 text-sm text-slate-400">
                    {formatPrice(it.price)} each · {it.stock} in stock
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <div className="inline-flex items-center overflow-hidden rounded-full border border-white/10 bg-white">
                      <span className="min-w-[2.4rem] px-3 py-1.5 text-center text-sm font-semibold">
                        ×{it.quantity}
                      </span>
                      <button
                        type="button"
                        disabled={it.quantity >= it.stock}
                        onClick={() => add(it.productId, 1).catch(() => undefined)}
                        className="border-l border-white/10 px-3 py-1.5 text-sm text-slate-300 hover:text-[var(--color-primary)] disabled:opacity-30"
                      >
                        Add one
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(it.productId)}
                      className="text-sm text-slate-500 hover:text-rose-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="text-left md:text-right">
                  <div className="text-lg font-bold">{formatPrice(it.price * it.quantity)}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="commerce-panel h-fit p-5">
          <div className="mono-label text-slate-300">Order summary</div>
          <dl className="mt-4 space-y-2 text-sm">
            <Row label="Subtotal" value={formatPrice(cart.subtotal)} />
            <Row label="Shipping" value="Calculated at checkout" muted />
            <Row label="Taxes" value="Included" muted />
            <div className="my-3 border-t border-white/10" />
            <Row label="Total" value={formatPrice(cart.subtotal)} bold />
          </dl>
          <Link href="/checkout" className="btn-primary mt-5 w-full">
            Checkout →
          </Link>
          <p className="mt-3 text-center text-xs leading-5 text-slate-500">
            Stripe test mode. Use the debit card example on the next screen.
          </p>
        </aside>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  muted,
  bold,
}: {
  label: string;
  value: string;
  muted?: boolean;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className={muted ? "text-slate-500" : "text-slate-400"}>{label}</dt>
      <dd className={`${bold ? "text-xl font-bold text-[var(--color-text)]" : "text-slate-200"}`}>
        {value}
      </dd>
    </div>
  );
}

function EmptyState({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta: { href: string; label: string };
}) {
  return (
    <div className="shell py-20 text-center">
      <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-lg bg-indigo-500/10 text-indigo-300">
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden="true">
          <path
            d="M3 3h2l2.5 12.5a2 2 0 002 1.5h8a2 2 0 002-1.6L21 7H6"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">{body}</p>
      <Link href={cta.href} className="btn-primary mt-6">
        {cta.label}
      </Link>
    </div>
  );
}
