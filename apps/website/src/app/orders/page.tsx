"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Order } from "@template/api";
import { useAuth } from "../../components/Providers";
import { api, formatDate, formatPrice } from "../../lib/api";

const STATUS_BADGE: Record<Order["status"], string> = {
  pending: "badge-warning",
  paid: "badge-info",
  shipped: "badge-info",
  delivered: "badge-success",
  canceled: "badge-error",
};

export default function OrdersPage() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user) {
      setFetching(false);
      return;
    }
    api<Order[]>("/orders")
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setFetching(false));
  }, [user]);

  if (loading) return <Loader />;

  if (!user) {
    return (
      <div className="shell py-20 text-center">
        <h1 className="text-2xl font-bold">Sign in to view your orders</h1>
        <Link href="/login" className="btn-primary mt-6">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <section className="commerce-hero">
        <div className="shell grid gap-5 py-8 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <div className="mono-label text-[var(--color-primary)]">Account</div>
            <h1 className="font-display mt-2 text-5xl font-bold leading-none">Your orders</h1>
            <p className="mt-3 text-sm text-slate-400">
              Payment status, fulfillment progress, and receipts from your Shopora demo account.
            </p>
          </div>
          <Link href="/products" className="btn-secondary w-fit">
            Continue shopping
          </Link>
        </div>
      </section>

      <div className="shell py-8">
        {fetching ? (
          <Loader />
        ) : orders.length === 0 ? (
          <div className="commerce-panel p-10 text-center">
            <div className="text-base font-semibold">No orders yet</div>
            <p className="mt-1 text-sm text-slate-400">Place your first order in minutes.</p>
            <Link href="/products" className="btn-primary mt-5">
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {orders.map((o) => (
              <OrderCard key={o.id} order={o} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  return (
    <Link
      href={`/order/?id=${order.id}`}
      className="commerce-panel block p-5 transition hover:border-[var(--color-primary)]"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mono-label text-slate-500">Order · {order.id.slice(-8)}</div>
          <div className="mt-2 text-lg font-semibold">
            {order.items.length} item{order.items.length === 1 ? "" : "s"} ·{" "}
            {formatPrice(order.totalAmount)}
          </div>
          <div className="mt-1 text-xs text-slate-400">{formatDate(order.createdAt)}</div>
        </div>
        <span className={STATUS_BADGE[order.status]}>{order.status.toUpperCase()}</span>
      </div>
      <div className="mt-5 flex items-center justify-between gap-4">
        <div className="flex -space-x-3">
          {order.items.slice(0, 6).map((it) => (
            <img
              key={it.productId}
              src={it.image}
              alt=""
              className="h-11 w-11 rounded-full border border-white object-cover shadow-sm"
            />
          ))}
          {order.items.length > 6 && (
            <div className="grid h-11 w-11 place-items-center rounded-full border border-white bg-[var(--color-text)] text-xs text-white shadow-sm">
              +{order.items.length - 6}
            </div>
          )}
        </div>
        <span className="text-sm font-semibold text-[var(--color-primary)]">View receipt →</span>
      </div>
    </Link>
  );
}

function Loader() {
  return (
    <div className="shell py-8">
      <div className="h-32 animate-pulse rounded-lg bg-slate-900/60" />
    </div>
  );
}
