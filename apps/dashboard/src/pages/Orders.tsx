import { useEffect, useState } from "react";
import type { Order, OrderStatus } from "@template/api";
import { api, formatDateTime, formatPrice } from "../lib/api";
import { useToast } from "../components/Toast";

const STATUSES: OrderStatus[] = ["pending", "paid", "shipped", "delivered", "canceled"];

const STATUS_BADGE: Record<OrderStatus, string> = {
  pending: "badge-warning",
  paid: "badge-info",
  shipped: "badge-info",
  delivered: "badge-success",
  canceled: "badge-error",
};

function getPaymentLabel(order: Order): string {
  if (order.paymentId?.startsWith("stripe_")) return "Stripe Checkout";
  if (order.paymentId) return "Payment recorded";
  return "Awaiting payment";
}

export function OrdersPage() {
  const toast = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [active, setActive] = useState<Order | null>(null);

  function refresh() {
    setLoading(true);
    api<Order[]>("/admin/orders")
      .then(setOrders)
      .finally(() => setLoading(false));
  }
  useEffect(refresh, []);

  const filtered = orders.filter((o) => (filter === "all" ? true : o.status === filter));

  async function updateStatus(id: string, status: OrderStatus) {
    try {
      const updated = await api<Order>(`/admin/orders/${id}`, {
        method: "PUT",
        body: { id, status },
      });
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
      if (active?.id === id) setActive(updated);
      toast.show(`Order #${id.slice(-6)} → ${status}`, "success");
    } catch (err) {
      toast.show(err instanceof Error ? err.message : "Failed", "error");
    }
  }

  return (
    <div className="admin-page pb-24 pt-20 lg:pt-8">
      <div className="admin-hero">
        <div>
          <div className="admin-kicker">Operations</div>
          <h1 className="admin-title">Orders</h1>
          <p className="admin-subtitle">
            Review order status, customer context, payment state, and fulfillment progression.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <FilterChip
          label={`All (${orders.length})`}
          active={filter === "all"}
          onClick={() => setFilter("all")}
        />
        {STATUSES.map((s) => {
          const count = orders.filter((o) => o.status === s).length;
          return (
            <FilterChip
              key={s}
              label={`${s} (${count})`}
              active={filter === s}
              onClick={() => setFilter(s)}
            />
          );
        })}
      </div>

      <div className="table-shell mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-white/5 text-left text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-3">Order</th>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Items</th>
              <th className="px-5 py-3">Total</th>
              <th className="px-5 py-3">Payment</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center text-slate-500">
                  Loading…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center text-slate-500">
                  No orders
                </td>
              </tr>
            ) : (
              filtered.map((o) => (
                <tr key={o.id} className="table-row">
                  <td className="px-5 py-3 font-mono text-xs text-slate-400">#{o.id.slice(-8)}</td>
                  <td className="px-5 py-3">
                    <div className="font-medium">{o.userName ?? "—"}</div>
                    <div className="text-xs text-slate-500">{o.userEmail ?? ""}</div>
                  </td>
                  <td className="px-5 py-3 text-slate-400">{formatDateTime(o.createdAt)}</td>
                  <td className="px-5 py-3 text-slate-400">{o.items.length}</td>
                  <td className="px-5 py-3 font-semibold">{formatPrice(o.totalAmount)}</td>
                  <td className="px-5 py-3">
                    <div className="text-sm font-medium">{getPaymentLabel(o)}</div>
                    {o.paymentId?.startsWith("stripe_") && (
                      <div className="mt-1 text-xs font-semibold text-[var(--color-primary)]">
                        Verified
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className={STATUS_BADGE[o.status]}>{o.status}</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setActive(o)}
                      className="btn-secondary text-xs"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {active && (
        <OrderDetail order={active} onClose={() => setActive(null)} onUpdate={updateStatus} />
      )}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium capitalize transition ${
        active
          ? "border-indigo-500/50 bg-indigo-500/15 text-indigo-200"
          : "border-white/10 bg-white/5 text-slate-300 hover:border-white/30"
      }`}
    >
      {label}
    </button>
  );
}

function OrderDetail({
  order,
  onClose,
  onUpdate,
}: {
  order: Order;
  onClose: () => void;
  onUpdate: (id: string, status: OrderStatus) => void;
}) {
  const paymentLabel = getPaymentLabel(order);
  const stripeVerified = order.paymentId?.startsWith("stripe_");
  const unpaid = !order.paymentId;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Order ${order.id.slice(-8)} details`}
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 p-4 backdrop-blur"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      tabIndex={-1}
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-white/10 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-500">Order</div>
            <h2 className="mt-1 text-xl font-bold">#{order.id.slice(-8)}</h2>
            <p className="mt-1 text-xs text-slate-400">{formatDateTime(order.createdAt)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-[var(--color-primary)]"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <Box label="Customer">
            <div className="font-medium">{order.userName ?? "—"}</div>
            <div className="text-xs text-slate-500">{order.userEmail ?? ""}</div>
          </Box>
          <Box label="Payment">
            <div className="flex flex-wrap items-center gap-2">
              <span className={STATUS_BADGE[order.status]}>{order.status}</span>
              {stripeVerified && <span className="badge-info">Stripe verified</span>}
            </div>
            <div className="mt-3 text-sm font-semibold">{paymentLabel}</div>
            {order.paymentId && (
              <div className="mt-2 break-all font-mono text-xs text-slate-500">
                {order.paymentId}
              </div>
            )}
          </Box>
          <Box label="Shipping">
            <div className="whitespace-pre-wrap text-slate-300">{order.shippingAddress}</div>
          </Box>
        </div>

        <div className="mt-5 space-y-2">
          {order.items.map((it) => (
            <div
              key={it.productId}
              className="flex items-center gap-3 rounded-lg border border-white/5 bg-slate-950/40 p-3"
            >
              <img src={it.image} alt="" className="h-10 w-10 rounded-md object-cover" />
              <div className="flex-1 truncate text-sm">{it.name}</div>
              <div className="text-xs text-slate-400">×{it.quantity}</div>
              <div className="w-20 text-right text-sm font-semibold">
                {formatPrice(it.price * it.quantity)}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-1 text-sm">
          <Row label="Subtotal" value={formatPrice(order.subtotal)} />
          {order.discountCode && (
            <Row
              label={`Discount (${order.discountCode})`}
              value={`− ${formatPrice(order.discountAmount)}`}
            />
          )}
          <Row label="Total" value={formatPrice(order.totalAmount)} bold />
        </div>

        <div className="mt-5 border-t border-white/5 pt-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Update status
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {STATUSES.map((s) => {
              const requiresPayment = ["paid", "shipped", "delivered"].includes(s);
              const disabled = order.status === s || (unpaid && requiresPayment);
              return (
                <button
                  key={s}
                  type="button"
                  disabled={disabled}
                  onClick={() => onUpdate(order.id, s)}
                  title={
                    unpaid && requiresPayment
                      ? "Stripe payment must be verified before fulfillment"
                      : undefined
                  }
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition ${
                    disabled
                      ? "cursor-not-allowed border border-indigo-500/40 bg-indigo-500/15 text-indigo-200"
                      : "border border-white/10 bg-white/5 hover:border-white/30"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function Box({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-white/5 bg-slate-950/40 p-3 text-sm">
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-400">{label}</span>
      <span className={bold ? "text-base font-bold text-[var(--color-text)]" : "text-slate-200"}>
        {value}
      </span>
    </div>
  );
}
