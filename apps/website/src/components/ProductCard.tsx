"use client";

import Link from "next/link";
import type { Product } from "@template/api";
import { useCart } from "./Providers";
import { formatPrice } from "../lib/api";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  return (
    <div className="premium-panel group relative flex flex-col overflow-hidden rounded-md transition hover:-translate-y-1 hover:border-[var(--color-primary)]">
      <Link href={`/product/?id=${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-[var(--color-surface-2)]">
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          {product.featured && (
            <span className="absolute left-3 top-3 rounded-full bg-white/92 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)] shadow-sm">
              Featured
            </span>
          )}
          {product.stock === 0 && (
            <span className="absolute right-3 top-3 rounded-full bg-[var(--color-error)] px-2.5 py-0.5 text-[10px] font-semibold uppercase text-white">
              Sold out
            </span>
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        {product.categoryName && (
          <span className="mono-label text-slate-500">{product.categoryName}</span>
        )}
        <Link
          href={`/product/?id=${product.id}`}
          className="text-base font-semibold leading-snug text-[var(--color-text)] hover:text-[var(--color-primary)]"
        >
          {product.name}
        </Link>
        <div className="mt-auto flex items-center justify-between gap-3 pt-1">
          <div>
            <div className="text-lg font-bold text-[var(--color-text)]">
              {formatPrice(product.price)}
            </div>
            <div className="flex items-center gap-1 text-xs text-[var(--color-secondary)]">
              <Star /> <span className="text-slate-400">{product.rating.toFixed(1)}</span>
            </div>
          </div>
          <button
            type="button"
            disabled={product.stock === 0}
            onClick={() => add(product.id, 1).catch(() => undefined)}
            className="grid h-10 w-10 place-items-center rounded-full bg-[rgba(11,107,86,0.08)] text-[var(--color-primary)] ring-1 ring-[rgba(11,107,86,0.22)] transition hover:bg-[var(--color-primary)] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Add to cart"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function Star() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
      <path d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.7 7-6.3-3.8L5.7 21l1.7-7L2 9.5l7.1-.6L12 2z" />
    </svg>
  );
}
