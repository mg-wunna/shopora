"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, useCart } from "./Providers";
import { DOCS_URL, PORTFOLIO_URL } from "../lib/project";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/case-study", label: "Case Study" },
  { href: "/orders", label: "Orders" },
];

export function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const cartCount = cart.items.reduce((s, it) => s + it.quantity, 0);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-white/88 backdrop-blur-xl">
      <div className="shell flex items-center justify-between gap-4 py-3.5">
        <Link href="/" className="flex items-center gap-3">
          <div className="brand-mark grid h-9 w-9 place-items-center rounded-md">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
              <path
                d="M5 7.5h14l-1.4 9.5a2 2 0 01-2 1.7H8.4a2 2 0 01-2-1.7L5 7.5z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 7.5V6a3 3 0 116 0v1.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="font-display text-2xl font-bold leading-none tracking-tight">
            Shop<span className="gradient-text">ora</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => {
            const active =
              pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-[rgba(11,107,86,0.08)] text-[var(--color-primary)]"
                    : "text-slate-500 hover:text-[var(--color-primary)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <a
            href={DOCS_URL}
            target="_blank"
            rel="noreferrer"
            className="rounded-md px-3 py-2 text-sm font-semibold text-slate-500 transition hover:text-[var(--color-primary)]"
          >
            API Docs
          </a>
          <a
            href={PORTFOLIO_URL}
            target="_blank"
            rel="noreferrer"
            className="rounded-md px-3 py-2 text-sm font-semibold text-slate-500 transition hover:text-[var(--color-primary)]"
          >
            Portfolio
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/cart"
            className="relative grid h-10 w-10 place-items-center rounded-md border border-[var(--color-border)] bg-white transition hover:border-[var(--color-primary)] hover:bg-[rgba(11,107,86,0.06)]"
            aria-label="Cart"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
              <path
                d="M3 3h2l2.5 12.5a2 2 0 002 1.5h8a2 2 0 002-1.6L21 7H6"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="9" cy="20" r="1.5" fill="currentColor" />
              <circle cx="17" cy="20" r="1.5" fill="currentColor" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[var(--color-primary)] px-1 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/orders"
                className="hidden items-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--color-text)] hover:border-[var(--color-primary)] sm:inline-flex"
              >
                <span className="grid h-6 w-6 place-items-center rounded-full bg-[var(--color-primary)] text-[10px] font-bold uppercase text-white">
                  {user.name.charAt(0)}
                </span>
                {user.name.split(" ")[0]}
              </Link>
              <button type="button" onClick={logout} className="btn-ghost text-xs">
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Link href="/login" className="btn-ghost text-sm">
                Sign in
              </Link>
              <Link href="/register" className="btn-primary text-sm">
                Get started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
