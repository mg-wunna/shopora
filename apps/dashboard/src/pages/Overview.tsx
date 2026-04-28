import { useEffect, useState } from "react";
import type { Analytics } from "@template/api";
import { api, formatDate, formatPrice } from "../lib/api";

const STATUS_BADGE: Record<string, string> = {
  pending: "badge-warning",
  paid: "badge-info",
  shipped: "badge-info",
  delivered: "badge-success",
  canceled: "badge-error",
};

export function OverviewPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<Analytics>("/admin/analytics")
      .then(setData)
      .catch((err: Error) => setError(err.message));
  }, []);

  if (error) {
    return (
      <div className="admin-page">
        <div className="rounded-md border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="admin-page grid gap-4 pt-20 md:grid-cols-2 lg:grid-cols-4 lg:pt-8">
        {Array.from({ length: 4 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: skel
          <div key={i} className="h-28 animate-pulse rounded-md bg-white/5" />
        ))}
      </div>
    );
  }

  const maxRevenue = Math.max(1, ...data.revenueByDay.map((d) => d.revenue));

  return (
    <div className="admin-page pb-24 pt-20 lg:pt-8">
      <div className="admin-hero">
        <div>
          <div className="admin-kicker">Overview</div>
          <h1 className="admin-title">Store command.</h1>
          <p className="admin-subtitle">
            Premium catalog operations, recent order health, and revenue movement from the seeded
            Shopora API.
          </p>
        </div>
        <span className="mono-label text-slate-400">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </span>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total revenue" value={formatPrice(data.totalRevenue)} icon={<DollarIcon />} />
        <Stat label="Orders" value={String(data.totalOrders)} icon={<CartIcon />} />
        <Stat label="Products" value={String(data.totalProducts)} icon={<BoxIcon />} />
        <Stat label="Customers" value={String(data.totalUsers)} icon={<UsersIcon />} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-[22px] font-semibold leading-tight">Revenue, last 7 days</h2>
            <span className="mono-label text-slate-500">paid · shipped · delivered</span>
          </div>
          {data.revenueByDay.length === 0 ? (
            <div className="grid h-48 place-items-center text-sm text-slate-500">
              No revenue yet
            </div>
          ) : (
            <div className="flex h-48 items-end gap-3 px-2">
              {data.revenueByDay.map((d) => (
                <div key={d.day} className="group flex flex-1 flex-col items-center gap-2">
                  <div className="relative w-full flex-1">
                    <div
                      className="absolute bottom-0 left-1/2 w-8 -translate-x-1/2 rounded-t-md bg-gradient-to-t from-[var(--color-primary)] to-[var(--color-secondary)] transition-all"
                      style={{ height: `${(d.revenue / maxRevenue) * 100}%` }}
                    />
                    <div className="absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap rounded bg-slate-950 px-2 py-0.5 text-[10px] text-white opacity-0 group-hover:opacity-100">
                      {formatPrice(d.revenue)}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500">{d.day.slice(5)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <h2 className="mb-4 text-[22px] font-semibold leading-tight">Top products</h2>
          {data.topProducts.length === 0 ? (
            <div className="text-sm text-slate-500">No paid orders yet.</div>
          ) : (
            <ul className="space-y-3">
              {data.topProducts.map((p, i) => (
                <li key={p.productId} className="flex items-center gap-3">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-white/5 text-xs font-bold text-slate-300">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{p.name}</div>
                    <div className="text-xs text-slate-500">{p.sold} sold</div>
                  </div>
                  <div className="text-sm font-semibold text-[var(--color-primary)]">
                    {formatPrice(p.revenue)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-6 card p-5">
        <h2 className="mb-4 text-[22px] font-semibold leading-tight">Recent orders</h2>
        {data.recentOrders.length === 0 ? (
          <div className="text-sm text-slate-500">No orders yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="pb-3">Order</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Items</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((o) => (
                  <tr key={o.id} className="table-row">
                    <td className="py-3 font-mono text-xs text-slate-400">#{o.id.slice(-8)}</td>
                    <td className="py-3">{o.userName ?? "—"}</td>
                    <td className="py-3 text-slate-400">{formatDate(o.createdAt)}</td>
                    <td className="py-3 text-slate-400">{o.items.length}</td>
                    <td className="py-3 font-semibold">{formatPrice(o.totalAmount)}</td>
                    <td className="py-3">
                      <span className={STATUS_BADGE[o.status]}>{o.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="metric-card">
      <div className="relative flex items-start justify-between">
        <div>
          <div className="mono-label text-slate-500">{label}</div>
          <div className="mt-3 text-3xl font-bold leading-none">{value}</div>
        </div>
        <div className="relative z-10 grid h-9 w-9 place-items-center rounded-md bg-white/5 text-slate-200">
          {icon}
        </div>
      </div>
    </div>
  );
}

function DollarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        d="M12 1v22M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        d="M3 3h2l2.5 12.5a2 2 0 002 1.5h8a2 2 0 002-1.6L21 7H6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
function BoxIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        d="M3 7l9-4 9 4M3 7v10l9 4 9-4V7M3 7l9 4M21 7l-9 4M12 11v10"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        d="M16 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
