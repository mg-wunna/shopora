"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Category, Product, ProductListResult } from "@template/api";
import { ProductCard } from "../components/ProductCard";
import { api } from "../lib/api";
import { DASHBOARD_URL, DOCS_URL, PORTFOLIO_URL, REPO_URL, projectStats } from "../lib/project";

const buildPhases = [
  {
    n: "01",
    title: "Contract-first API",
    body: "oRPC contracts, Zod schemas, OpenAPI generation, Scalar docs, and bearer-auth protected admin routes.",
  },
  {
    n: "02",
    title: "Commerce model",
    body: "Products, categories, discounts, carts, orders, payment simulation, and stock-aware checkout.",
  },
  {
    n: "03",
    title: "Storefront",
    body: "Next.js 15 static export with product discovery, cart persistence, account flows, and order tracking.",
  },
  {
    n: "04",
    title: "Admin console",
    body: "React 19 dashboard for catalog, order operations, users, discounts, and revenue analytics.",
  },
];

export default function Home() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [latest, setLatest] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api<ProductListResult>("/products", { auth: false, query: { featured: true, limit: 6 } }),
      api<ProductListResult>("/products", { auth: false, query: { sort: "newest", limit: 8 } }),
      api<Category[]>("/categories", { auth: false }),
    ])
      .then(([f, l, c]) => {
        setFeatured(f.items);
        setLatest(l.items);
        setCategories(c);
      })
      .catch((err: Error) => setError(err.message));
  }, []);

  return (
    <div>
      <Hero featured={featured} />

      {error && (
        <div className="shell mt-6">
          <div className="rounded-md border border-[rgba(161,92,8,0.35)] bg-[rgba(161,92,8,0.1)] px-4 py-3 text-sm text-[var(--color-text)]">
            Could not reach API. Start the server on <code>http://localhost:3000</code> and run{" "}
            <code>bun run seed</code> for demo data.
          </div>
        </div>
      )}

      <ProofStrip />

      {categories.length > 0 && <CategorySection categories={categories} />}

      {featured.length > 0 && (
        <ProductSection
          eyebrow="Featured edit"
          title="Six products that sell the system."
          cta={{ href: "/products?featured=true", label: "View featured" }}
          products={featured.slice(0, 3)}
        />
      )}

      <ProductSection
        eyebrow="New arrivals"
        title="Fresh catalog, real data."
        cta={{ href: "/products", label: "Browse store" }}
        products={latest}
        compact
      />

      <BuildEvidence />
      <PortfolioPanel />
    </div>
  );
}

function Hero({ featured }: { featured: Product[] }) {
  const heroProducts = featured.slice(0, 3);

  return (
    <section className="hero-stage relative overflow-hidden">
      <div className="shell relative z-10 pb-14 pt-12 lg:pb-20 lg:pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-[0.88fr_1.12fr]">
          <div>
            <p className="mono-label reveal text-[var(--color-primary)]">
              Portfolio commerce system
            </p>
            <h1 className="reveal reveal-d1 font-display mt-3 max-w-2xl text-[56px] font-bold leading-[0.9] tracking-tight sm:text-7xl lg:text-8xl">
              Shopora
            </h1>
            <p className="reveal reveal-d2 mt-5 max-w-xl text-lg leading-8 text-[var(--color-text-muted)]">
              A premium storefront and operations console built end-to-end: real catalog data,
              account flows, cart, discounts, Stripe Checkout, typed API contracts, and docs ready
              for review.
            </p>
            <div className="reveal reveal-d3 mt-9 flex flex-wrap gap-3">
              <Link href="/products" className="btn-primary">
                Shop the demo <span aria-hidden>→</span>
              </Link>
              <Link href="/case-study" className="btn-secondary">
                Read case study
              </Link>
              <a href={DOCS_URL} target="_blank" rel="noreferrer" className="btn-secondary">
                API docs
              </a>
            </div>
          </div>

          <div className="reveal reveal-d4">
            <div className="relative">
              <div className="absolute -left-5 top-7 h-[calc(100%-1.75rem)] w-[calc(100%+1.25rem)] rounded-md border border-[rgba(184,135,52,0.28)]" />
              <div className="relative grid grid-cols-[1fr_0.72fr] gap-3">
                <HeroProduct product={heroProducts[0]} fallback="Auralis Maison Headphones" large />
                <div className="grid gap-3">
                  <HeroProduct product={heroProducts[1]} fallback="Vertex Studio 14" />
                  <div className="premium-panel rounded-md p-5">
                    <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                      {projectStats.map((stat) => (
                        <div key={stat.label}>
                          <div className="font-display text-3xl font-bold leading-none">
                            {stat.value}
                          </div>
                          <div className="mono-label mt-1 text-[var(--color-text-muted)]">
                            {stat.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroProduct({
  product,
  fallback,
  large,
}: {
  product?: Product;
  fallback: string;
  large?: boolean;
}) {
  const image = product?.images[0] || "/images/products/auralis-maison-headphones.jpg";
  const name = product?.name || fallback;

  return (
    <Link
      href={product ? `/product/?id=${product.id}` : "/products"}
      className={`group relative overflow-hidden rounded-md bg-[var(--color-surface-2)] shadow-[0_24px_70px_-52px_rgba(17,24,22,0.62)] ${
        large ? "min-h-[520px]" : "min-h-[252px]"
      }`}
    >
      <img
        src={image}
        alt={name}
        className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/12 to-transparent" />
      <div className="image-overlay-copy absolute bottom-0 left-0 right-0 p-5">
        <div className="mono-label image-overlay-muted">{product?.categoryName || "Featured"}</div>
        <div className="font-display mt-1 text-2xl font-bold leading-tight">{name}</div>
      </div>
    </Link>
  );
}

function ProofStrip() {
  return (
    <section className="border-y border-[var(--color-border)] bg-white/74">
      <div className="shell grid gap-4 py-5 md:grid-cols-4">
        {[
          ["Storefront", "Next.js 15 SSG"],
          ["API", "Hono + oRPC + OpenAPI"],
          ["Data", "MongoDB + seeded catalog"],
          ["Admin", "React 19 operations console"],
        ].map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between gap-4 md:block">
            <div className="mono-label text-[var(--color-primary)]">{k}</div>
            <div className="mt-1 text-sm font-semibold">{v}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CategorySection({ categories }: { categories: Category[] }) {
  return (
    <section className="shell py-16">
      <SectionTitle eyebrow="Catalog architecture" title="Six departments, one buying flow." />
      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {categories.map((category, index) => (
          <Link
            key={category.id}
            href={`/products/?category=${category.id}`}
            className="premium-panel group rounded-md p-4 transition hover:-translate-y-0.5 hover:border-[var(--color-primary)]"
          >
            <div className="mono-label text-[var(--color-primary)]">0{index + 1}</div>
            <div className="font-display mt-8 text-2xl font-bold leading-tight">
              {category.name}
            </div>
            <div className="mt-2 text-xs text-slate-500">Open edit →</div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ProductSection({
  eyebrow,
  title,
  cta,
  products,
  compact,
}: {
  eyebrow: string;
  title: string;
  cta: { href: string; label: string };
  products: Product[];
  compact?: boolean;
}) {
  return (
    <section className="shell py-16">
      <SectionTitle eyebrow={eyebrow} title={title} cta={cta} />
      <div
        className={`mt-8 grid gap-5 ${compact ? "sm:grid-cols-2 lg:grid-cols-4" : "lg:grid-cols-3"}`}
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

function BuildEvidence() {
  return (
    <section className="shell py-16" id="build">
      <SectionTitle
        eyebrow="Engineering proof"
        title="Built like a real product, shaped like a case study."
        cta={{ href: "/case-study", label: "See the breakdown" }}
      />
      <div className="mt-8 grid gap-4 lg:grid-cols-4">
        {buildPhases.map((phase) => (
          <article key={phase.n} className="premium-panel rounded-md p-5">
            <div className="mono-label text-[var(--color-primary)]">Phase {phase.n}</div>
            <h3 className="mt-5 text-lg font-semibold leading-tight">{phase.title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-400">{phase.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function PortfolioPanel() {
  return (
    <section className="shell py-16">
      <div className="premium-panel grid gap-8 rounded-lg p-6 md:grid-cols-[1fr_0.72fr] md:p-8">
        <div>
          <p className="mono-label text-[var(--color-primary)]">For portfolio review</p>
          <h2 className="font-display mt-3 max-w-xl text-[34px] font-bold leading-tight tracking-tight md:text-5xl">
            Inspect the whole system.
          </h2>
        </div>
        <div className="flex flex-col justify-between gap-8">
          <p className="text-sm leading-7 text-slate-400">
            Shopora is meant to be reviewed as a fullstack portfolio project. Open the admin,
            inspect the API docs, read the decisions, or jump back to Mg Wunna's main portfolio.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <a href={DASHBOARD_URL} className="btn-primary">
              Open dashboard
            </a>
            <a href={DOCS_URL} target="_blank" rel="noreferrer" className="btn-secondary">
              API reference
            </a>
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="btn-secondary">
              GitHub repo
            </a>
            <a href={PORTFOLIO_URL} target="_blank" rel="noreferrer" className="btn-secondary">
              Mg Wunna website
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionTitle({
  eyebrow,
  title,
  cta,
}: {
  eyebrow: string;
  title: string;
  cta?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col justify-between gap-5 border-t border-[var(--color-border)] pt-5 md:flex-row md:items-end">
      <div>
        <div className="mono-label text-[var(--color-primary)]">{eyebrow}</div>
        <h2 className="font-display mt-2 max-w-3xl text-[34px] font-bold leading-tight tracking-tight md:text-5xl">
          {title}
        </h2>
      </div>
      {cta && (
        <Link href={cta.href} className="btn-secondary w-fit">
          {cta.label} <span aria-hidden>→</span>
        </Link>
      )}
    </div>
  );
}
