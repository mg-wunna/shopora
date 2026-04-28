"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Product } from "@template/api";
import { useCart } from "../../components/Providers";
import { api, formatPrice } from "../../lib/api";

export default function ProductDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="shell py-10">
          <div className="h-96 animate-pulse rounded-2xl bg-slate-900/60" />
        </div>
      }
    >
      <ProductDetail />
    </Suspense>
  );
}

function ProductDetail() {
  const params = useSearchParams();
  const id = params.get("id");
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const { add } = useCart();
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api<Product>(`/products/${id}`, { auth: false })
      .then((p) => setProduct(p))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (!id) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Link
          href="/products"
          className="mt-4 inline-block text-indigo-300 hover:text-[var(--color-primary)]"
        >
          ← Back to all products
        </Link>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="shell py-10">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-lg border border-white/10 bg-slate-900/60" />
          <div className="space-y-3">
            <div className="h-8 w-3/4 animate-pulse rounded bg-slate-800" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-slate-800" />
            <div className="h-32 animate-pulse rounded bg-slate-800/60" />
          </div>
        </div>
      </div>
    );
  }
  if (error || !product) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="text-2xl font-bold">Product not available</h1>
        <p className="mt-2 text-sm text-slate-400">{error}</p>
        <Link
          href="/products"
          className="mt-4 inline-block text-indigo-300 hover:text-[var(--color-primary)]"
        >
          ← Back to all products
        </Link>
      </div>
    );
  }

  async function onAdd() {
    if (!product) return;
    setAdding(true);
    try {
      await add(product.id, qty);
    } catch {
      /* toast already handled */
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="shell py-10">
      <Link
        href="/products"
        className="mb-6 inline-flex items-center gap-1 text-sm text-slate-400 hover:text-[var(--color-primary)]"
      >
        ← All products
      </Link>
      <div className="grid gap-10 md:grid-cols-[0.95fr_1fr]">
        <div className="space-y-3">
          <div className="premium-panel overflow-hidden rounded-lg p-2">
            <img
              src={product.images[activeImage] ?? product.images[0]}
              alt={product.name}
              className="aspect-square w-full rounded-md object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((src, i) => (
                <button
                  // biome-ignore lint/suspicious/noArrayIndexKey: thumb idx
                  key={i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`h-20 w-20 overflow-hidden rounded-lg border-2 transition ${
                    activeImage === i
                      ? "border-indigo-500"
                      : "border-white/10 hover:border-[var(--color-primary)]"
                  }`}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          {product.categoryName && (
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              {product.categoryName}
            </span>
          )}
          <h1 className="font-display mt-2 text-5xl font-bold leading-none tracking-tight">
            {product.name}
          </h1>
          <div className="mt-3 flex items-center gap-3">
            <Stars rating={product.rating} />
            <span className="text-sm text-slate-400">{product.rating.toFixed(1)} rating</span>
          </div>
          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
            {product.stock > 0 ? (
              <span className="badge-success">In stock · {product.stock} left</span>
            ) : (
              <span className="badge-error">Out of stock</span>
            )}
          </div>

          <p className="mt-6 max-w-xl text-base leading-8 text-slate-300">{product.description}</p>

          <div className="mt-8 flex items-end gap-3">
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Quantity
              </div>
              <div className="flex items-center rounded-full border border-white/10 bg-white">
                <button
                  type="button"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-3 py-2 text-slate-300 hover:text-[var(--color-primary)]"
                >
                  −
                </button>
                <span className="w-10 text-center text-sm font-semibold">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty(Math.min(product.stock, qty + 1))}
                  className="px-3 py-2 text-slate-300 hover:text-[var(--color-primary)]"
                >
                  +
                </button>
              </div>
            </div>
            <button
              type="button"
              disabled={adding || product.stock === 0}
              onClick={onAdd}
              className="btn-primary flex-1"
            >
              {adding ? "Adding…" : product.stock === 0 ? "Out of stock" : "Add to cart"}
            </button>
          </div>

          <div className="mt-8 grid gap-3 rounded-lg border border-white/10 bg-white/80 p-4 text-sm">
            <Feature label="Free shipping" detail="On orders over $99" />
            <Feature label="30-day returns" detail="No questions asked" />
            <Feature label="Secure checkout" detail="Stripe Checkout in test mode" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5 text-[var(--color-secondary)]">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          // biome-ignore lint/suspicious/noArrayIndexKey: star
          key={i}
          viewBox="0 0 24 24"
          className={`h-4 w-4 ${i < Math.round(rating) ? "fill-current" : "fill-slate-300"}`}
          aria-hidden="true"
        >
          <path d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.7 7-6.3-3.8L5.7 21l1.7-7L2 9.5l7.1-.6L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function Feature({ label, detail }: { label: string; detail: string }) {
  return (
    <div className="flex items-center gap-3">
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4 text-[var(--color-primary)]"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M5 12l4 4L19 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div>
        <span className="font-medium">{label}</span>{" "}
        <span className="text-slate-400">— {detail}</span>
      </div>
    </div>
  );
}
