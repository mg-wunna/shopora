"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Category, ProductListResult } from "@template/api";
import { ProductCard } from "../../components/ProductCard";
import { api } from "../../lib/api";

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to high" },
  { value: "price_desc", label: "Price: High to low" },
  { value: "rating", label: "Top rated" },
] as const;

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="shell py-10">
          <div className="h-32 animate-pulse rounded-lg bg-slate-900/60" />
        </div>
      }
    >
      <ProductsListing />
    </Suspense>
  );
}

function ProductsListing() {
  const params = useSearchParams();
  const initialCategory = params.get("category") ?? "";
  const initialFeatured = params.get("featured") === "true";
  const initialQ = params.get("q") ?? "";

  const [categories, setCategories] = useState<Category[]>([]);
  const [data, setData] = useState<ProductListResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(initialQ);
  const [debouncedQ, setDebouncedQ] = useState(initialQ);
  const [category, setCategory] = useState(initialCategory);
  const [featured, setFeatured] = useState(initialFeatured);
  const [sort, setSort] = useState<(typeof SORTS)[number]["value"]>("newest");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    api<Category[]>("/categories", { auth: false })
      .then(setCategories)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    setLoading(true);
    api<ProductListResult>("/products", {
      auth: false,
      query: {
        q: debouncedQ || undefined,
        category: category || undefined,
        featured: featured ? "true" : undefined,
        sort,
        maxPrice: maxPrice === "" ? undefined : maxPrice,
        page,
        limit: 12,
      },
    })
      .then((res) => setData(res))
      .catch(() => setData({ items: [], total: 0, page: 1, limit: 12 }))
      .finally(() => setLoading(false));
  }, [debouncedQ, category, featured, sort, maxPrice, page]);

  const totalPages = useMemo(() => {
    if (!data) return 1;
    return Math.max(1, Math.ceil(data.total / data.limit));
  }, [data]);

  function reset() {
    setQ("");
    setCategory("");
    setFeatured(false);
    setMaxPrice("");
    setPage(1);
  }

  return (
    <div>
      <section className="commerce-hero">
        <div className="shell grid gap-4 py-10 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <div className="mono-label text-[var(--color-primary)]">All products</div>
            <h1 className="font-display mt-2 text-5xl font-bold leading-none md:text-6xl">
              The store
            </h1>
            <p className="mt-3 text-sm text-slate-400">
              {data
                ? `${data.total} products curated across six departments.`
                : "Loading catalog..."}
            </p>
          </div>
          <div className="premium-panel rounded-md px-4 py-3 text-sm">
            <span className="font-semibold">Stripe test checkout</span>
            <span className="ml-2 text-slate-500">ready</span>
          </div>
        </div>
      </section>

      <div className="shell py-8">
        <div className="flex flex-col gap-2"></div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="space-y-6">
            <FilterCard title="Search">
              <input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                placeholder="Search products…"
                className="input"
              />
            </FilterCard>

            <FilterCard title="Category">
              <ul className="space-y-1.5 text-sm">
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setCategory("");
                      setPage(1);
                    }}
                    className={`w-full rounded-md px-2 py-1.5 text-left transition ${
                      category === ""
                        ? "bg-indigo-500/15 text-indigo-200"
                        : "text-slate-400 hover:text-[var(--color-primary)]"
                    }`}
                  >
                    All categories
                  </button>
                </li>
                {categories.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setCategory(c.id);
                        setPage(1);
                      }}
                      className={`w-full rounded-md px-2 py-1.5 text-left transition ${
                        category === c.id
                          ? "bg-indigo-500/15 text-indigo-200"
                          : "text-slate-400 hover:text-[var(--color-primary)]"
                      }`}
                    >
                      {c.name}
                    </button>
                  </li>
                ))}
              </ul>
            </FilterCard>

            <FilterCard title="Max price">
              <input
                type="number"
                min={0}
                value={maxPrice}
                onChange={(e) => {
                  const v = e.target.value;
                  setMaxPrice(v === "" ? "" : Number(v));
                  setPage(1);
                }}
                placeholder="No limit"
                className="input"
              />
            </FilterCard>

            <FilterCard title="Filters">
              <label className="flex cursor-pointer items-center justify-between gap-3 text-sm text-slate-300">
                <span>Featured only</span>
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => {
                    setFeatured(e.target.checked);
                    setPage(1);
                  }}
                  className="h-4 w-4 accent-indigo-500"
                />
              </label>
            </FilterCard>

            <button type="button" onClick={reset} className="btn-secondary w-full">
              Reset filters
            </button>
          </aside>

          <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-slate-400">
                {data ? `Showing ${data.items.length} of ${data.total}` : ""}
              </div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="input max-w-[220px]"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {loading ? (
              <ProductsSkeleton />
            ) : data && data.items.length === 0 ? (
              <div className="commerce-panel p-10 text-center">
                <div className="text-base font-semibold">No products match those filters</div>
                <p className="mt-1 text-sm text-slate-400">Try resetting and searching again.</p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {data?.items.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="btn-secondary disabled:opacity-40"
                >
                  ← Prev
                </button>
                <span className="text-sm text-slate-400">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="btn-secondary disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="commerce-panel p-4">
      <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-300">
        {title}
      </div>
      {children}
    </div>
  );
}

function ProductsSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
          key={i}
          className="aspect-[4/5] animate-pulse rounded-lg border border-white/10 bg-slate-900/60"
        />
      ))}
    </div>
  );
}
