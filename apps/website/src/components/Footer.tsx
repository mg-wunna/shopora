import { DOCS_URL, PORTFOLIO_URL, REPO_URL } from "../lib/project";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-[var(--color-border)] bg-white/82">
      <div className="shell grid gap-10 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="brand-mark grid h-8 w-8 place-items-center rounded-md">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                <path
                  d="M5 7.5h14l-1.4 9.5a2 2 0 01-2 1.7H8.4a2 2 0 01-2-1.7L5 7.5z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="font-display text-2xl font-bold leading-none">
              Shop<span className="gradient-text">ora</span>
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Premium commerce demo by Mg Wunna. Storefront, admin console, API docs, cart, checkout,
            seeded products, and production-shaped deployment notes.
          </p>
        </div>
        <FooterCol
          title="Product"
          items={[
            { href: "/products", label: "All products" },
            { href: "/products?featured=true", label: "Featured" },
            { href: "/orders", label: "My orders" },
          ]}
        />
        <FooterCol
          title="Portfolio"
          items={[
            { href: "/case-study", label: "Case study" },
            { href: DOCS_URL, label: "API docs" },
            { href: REPO_URL, label: "GitHub repo" },
            { href: PORTFOLIO_URL, label: "Mg Wunna website" },
          ]}
        />
        <FooterCol
          title="Stack"
          items={[
            { href: "#", label: "Hono + oRPC" },
            { href: "#", label: "Next.js 15" },
            { href: "#", label: "Mongoose + JWT" },
          ]}
        />
      </div>
      <div className="border-t border-[var(--color-border)]">
        <div className="shell flex flex-col items-center justify-between gap-2 py-5 text-xs text-slate-500 md:flex-row">
          <span>© {new Date().getFullYear()} Shopora. Demo project.</span>
          <span>
            Try <code className="text-slate-300">demo@shopora.dev</code> /{" "}
            <code className="text-slate-300">password</code>
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: { href: string; label: string }[] }) {
  return (
    <div>
      <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-300">
        {title}
      </div>
      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it.label}>
            <a href={it.href} className="text-sm text-slate-400 hover:text-[var(--color-primary)]">
              {it.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
