"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Order } from "@template/api";
import { useCart } from "../../components/Providers";
import { api, formatDate, formatPrice } from "../../lib/api";

const TIMELINE: Order["status"][] = ["pending", "paid", "shipped", "delivered"];

export default function OrderDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="shell py-10">
          <div className="h-44 animate-pulse rounded-lg bg-slate-900/60" />
        </div>
      }
    >
      <OrderDetail />
    </Suspense>
  );
}

function OrderDetail() {
  const params = useSearchParams();
  const id = params.get("id");
  const stripeStatus = params.get("stripe");
  const stripeSessionId = params.get("session_id");
  const { refresh: refreshCart } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    const request =
      stripeStatus === "success" && stripeSessionId
        ? api<Order>("/payment/stripe-confirm", {
            method: "POST",
            body: { orderId: id, sessionId: stripeSessionId },
          })
        : api<Order>(`/orders/${id}`);

    request
      .then(async (nextOrder) => {
        setOrder(nextOrder);
        if (nextOrder.status !== "pending") {
          await refreshCart();
          window.localStorage.setItem("shopora.cart.updated", String(Date.now()));
        }
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, refreshCart, stripeSessionId, stripeStatus]);

  if (loading) {
    return (
      <div className="shell py-10">
        <div className="h-44 animate-pulse rounded-lg bg-slate-900/60" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="shell py-20 text-center">
        <h1 className="text-2xl font-bold">Order not found</h1>
        <p className="mt-2 text-sm text-slate-400">{error}</p>
        <Link href="/orders" className="btn-primary mt-6">
          Back to orders
        </Link>
      </div>
    );
  }

  const stepIdx = order.status === "canceled" ? -1 : TIMELINE.indexOf(order.status);
  const paymentMethod = order.paymentId?.startsWith("stripe_")
    ? "Stripe Checkout"
    : order.paymentId
      ? "Payment recorded"
      : "Awaiting payment";

  return (
    <div>
      <section className="commerce-hero">
        <div className="shell py-8">
          <Link
            href="/orders"
            className="mb-6 inline-flex text-sm font-medium text-slate-400 hover:text-[var(--color-primary)]"
          >
            ← All orders
          </Link>
          <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <div className="mono-label text-[var(--color-primary)]">Order receipt</div>
              <h1 className="font-display mt-2 text-5xl font-bold leading-none">
                #{order.id.slice(-8)}
              </h1>
              <p className="mt-3 text-sm text-slate-400">Placed {formatDate(order.createdAt)}</p>
            </div>
            <div className="flex flex-wrap gap-2 md:justify-end">
              <StatusPill status={order.status} />
              {order.paymentId?.startsWith("stripe_") && (
                <span className="status-chip">Stripe verified</span>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="shell grid gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="commerce-panel h-fit p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mono-label text-slate-500">Fulfillment</div>
              <h2 className="font-display mt-2 text-3xl font-bold">Track this order</h2>
            </div>
            <div className="text-left md:text-right">
              <div className="text-xs text-slate-500">Payment method</div>
              <div className="mt-1 text-sm font-semibold text-[var(--color-text)]">
                {paymentMethod}
              </div>
            </div>
          </div>

          {order.status !== "canceled" && <Timeline stepIdx={stepIdx} />}

          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold">Items</h3>
              <span className="text-xs text-slate-500">
                {order.items.length} item{order.items.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="divide-y divide-white/5 rounded-lg border border-white/10 bg-white/72">
              {order.items.map((it) => (
                <div key={it.productId} className="flex items-center gap-4 p-3 md:p-4">
                  <img src={it.image} alt={it.name} className="h-16 w-16 rounded-md object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold md:text-base">{it.name}</div>
                    <div className="mt-1 text-xs text-slate-400">
                      {formatPrice(it.price)} × {it.quantity}
                    </div>
                  </div>
                  <div className="text-right text-sm font-bold md:text-base">
                    {formatPrice(it.price * it.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <MetaPanel title="Payment">
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-400">Status</span>
              <StatusPill status={order.status} compact />
            </div>
            {order.paymentId && (
              <div className="mt-4 border-t border-white/10 pt-4">
                <div className="text-xs text-slate-500">Reference</div>
                <div className="mt-1 break-all font-mono text-xs text-slate-300">
                  {order.paymentId}
                </div>
              </div>
            )}
          </MetaPanel>

          <MetaPanel title="Shipping to">
            <div className="whitespace-pre-wrap text-sm leading-6 text-slate-200">
              {order.shippingAddress}
            </div>
          </MetaPanel>

          <MetaPanel title="Totals">
            <dl className="space-y-2 text-sm">
              <Row label="Subtotal" value={formatPrice(order.subtotal)} />
              {order.discountCode && (
                <Row
                  label={`Discount (${order.discountCode})`}
                  value={`− ${formatPrice(order.discountAmount)}`}
                  positive
                />
              )}
              <div className="my-3 border-t border-white/10" />
              <Row label="Total" value={formatPrice(order.totalAmount)} bold />
            </dl>
          </MetaPanel>
        </aside>
      </div>
    </div>
  );
}

function Timeline({ stepIdx }: { stepIdx: number }) {
  const progressWidth =
    stepIdx <= 0
      ? "0%"
      : `${(Math.min(stepIdx, TIMELINE.length - 1) / (TIMELINE.length - 1)) * 75}%`;

  return (
    <div className="relative mt-7 grid grid-cols-4 gap-2">
      <div className="absolute left-[12.5%] right-[12.5%] top-4 h-px bg-[var(--color-border)]" />
      <div
        className="absolute left-[12.5%] top-4 h-px bg-[var(--color-primary)]"
        style={{ width: progressWidth }}
      />
      {TIMELINE.map((s, i) => {
        const complete = i <= stepIdx;
        return (
          <div key={s} className="relative z-10 flex flex-col items-center text-center text-xs">
            <div
              className={`grid h-8 w-8 place-items-center rounded-full font-bold ${
                complete
                  ? "bg-[var(--color-primary)] text-white shadow-[0_0_0_6px_rgba(11,107,86,0.08)]"
                  : "bg-white/5 text-slate-500"
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`mt-2 capitalize ${complete ? "text-[var(--color-text)]" : "text-slate-500"}`}
            >
              {s}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function MetaPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="commerce-panel p-5">
      <div className="mono-label mb-3 text-slate-400">{title}</div>
      {children}
    </section>
  );
}

function StatusPill({ status, compact }: { status: Order["status"]; compact?: boolean }) {
  return (
    <span
      className={`${compact ? "px-2 py-1 text-[10px]" : ""} ${
        status === "delivered"
          ? "badge-success"
          : status === "canceled"
            ? "badge-error"
            : status === "paid" || status === "shipped"
              ? "badge-info"
              : "badge-warning"
      }`}
    >
      {status.toUpperCase()}
    </span>
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
        className={`${bold ? "text-lg font-bold text-[var(--color-text)]" : positive ? "text-[var(--color-primary)]" : "text-slate-200"}`}
      >
        {value}
      </dd>
    </div>
  );
}
