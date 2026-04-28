import { useEffect, useState } from "react";
import type { Discount } from "@template/api";
import { api } from "../lib/api";
import { useToast } from "../components/Toast";

export function DiscountsPage() {
  const toast = useToast();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [percentage, setPercentage] = useState(10);
  const [days, setDays] = useState(30);
  const [creating, setCreating] = useState(false);

  function refresh() {
    setLoading(true);
    api<Discount[]>("/discounts")
      .then(setDiscounts)
      .finally(() => setLoading(false));
  }
  useEffect(refresh, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const expiresAt = Date.now() + days * 24 * 60 * 60 * 1000;
      await api<Discount>("/discounts", {
        method: "POST",
        body: { code: code.toUpperCase(), percentage, expiresAt },
      });
      toast.show(`Created ${code.toUpperCase()}`, "success");
      setCode("");
      refresh();
    } catch (err) {
      toast.show(err instanceof Error ? err.message : "Failed", "error");
    } finally {
      setCreating(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this discount?")) return;
    try {
      await api(`/discounts/${id}`, { method: "DELETE" });
      toast.show("Deleted", "success");
      refresh();
    } catch (err) {
      toast.show(err instanceof Error ? err.message : "Failed", "error");
    }
  }

  return (
    <div className="admin-page pb-24 pt-20 lg:pt-8">
      <div className="admin-hero">
        <div>
          <div className="admin-kicker">Marketing</div>
          <h1 className="admin-title">Discounts</h1>
          <p className="admin-subtitle">
            Create and expire promotional codes used by the public checkout flow.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]">
        <form onSubmit={onCreate} className="card h-fit p-5">
          <h2 className="text-sm font-semibold">Create discount code</h2>
          <div className="mt-4 space-y-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Code
              </span>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="SUMMER25"
                className="input"
                required
                minLength={2}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Percentage off
              </span>
              <input
                type="number"
                min={1}
                max={90}
                value={percentage}
                onChange={(e) => setPercentage(Number(e.target.value))}
                className="input"
                required
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Expires in (days)
              </span>
              <input
                type="number"
                min={1}
                max={365}
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="input"
                required
              />
            </label>
          </div>
          <button type="submit" disabled={creating} className="btn-primary mt-5 w-full">
            {creating ? "Creating…" : "Create code"}
          </button>
        </form>

        <div className="table-shell overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/5 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3">Code</th>
                <th className="px-5 py-3">Off</th>
                <th className="px-5 py-3">Expires</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                    Loading…
                  </td>
                </tr>
              ) : discounts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                    No active codes
                  </td>
                </tr>
              ) : (
                discounts.map((d) => {
                  const expired = d.expiresAt < Date.now();
                  return (
                    <tr key={d.id} className="table-row">
                      <td className="px-5 py-3 font-mono font-semibold text-indigo-300">
                        {d.code}
                      </td>
                      <td className="px-5 py-3 font-semibold">{d.percentage}%</td>
                      <td className="px-5 py-3 text-slate-400">
                        {new Date(d.expiresAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3">
                        {expired ? (
                          <span className="badge-error">Expired</span>
                        ) : (
                          <span className="badge-success">Active</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => onDelete(d.id)}
                          className="btn-danger text-xs"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
