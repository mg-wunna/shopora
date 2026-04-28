import Link from "next/link";
import { DASHBOARD_URL, DOCS_URL, PORTFOLIO_URL, REPO_URL, projectStats } from "../../lib/project";

export const metadata = {
  title: "Shopora — E-commerce payment integration case study",
  description:
    "A portfolio case study for an e-commerce platform with Stripe Checkout, order-first payment state, cart cleanup, inventory updates, and admin verification.",
};

const portfolioSignals = [
  {
    title: "Why this project works",
    body: "E-commerce is business-logic heavy: catalog, filters, cart state, authentication, orders, inventory, discounts, payment, and admin operations all have to agree.",
  },
  {
    title: "Project focus",
    body: "The case study highlights the customer checkout path and the operator workflow after payment instead of treating Stripe as a one-click redirect.",
  },
  {
    title: "What makes it special",
    body: "The payment integration proves external API work, server-owned session creation, sensitive payment boundaries, post-payment verification, and operational order review.",
  },
];

const featureHighlights = [
  "Product catalog with categories and filters",
  "Shopping cart with checkout handoff",
  "User authentication and order history",
  "Order management from pending to delivered",
  "Stripe payment gateway integration",
  "Inventory decrement after payment",
  "Admin dashboard for products and orders",
  "Discount codes and order tracking",
];

const decisions = [
  {
    n: "01",
    title: "Use hosted Stripe Checkout, not custom card fields.",
    body: "The app creates a pending order first, then asks the server for a Stripe Checkout session that opens in a new browser tab.",
    why: "Payment-sensitive card entry stays inside Stripe while the demo still proves a real integration boundary.",
  },
  {
    n: "02",
    title: "Treat payment as an order lifecycle, not a button.",
    body: "Checkout moves from cart to pending order, Stripe session, paid confirmation, stock decrement, cart cleanup, and receipt state.",
    why: "A credible payment demo must show what happens before and after Stripe, not only the redirect.",
  },
  {
    n: "03",
    title: "Make test payments obvious for reviewers.",
    body: "The checkout screen includes the Stripe test debit card, supporting details, and a click-to-copy control beside the card number.",
    why: "Reviewers should be able to complete the payment path without leaving the product to search Stripe docs.",
  },
  {
    n: "04",
    title: "Keep payment proof visible after checkout.",
    body: "Paid orders show Stripe verification on the receipt and remain inspectable in the admin order console.",
    why: "Payment integration should be auditable from both the customer receipt and the operator workflow.",
  },
];

const phases = [
  ["Order model", "Persist cart items into a pending order before any payment session is created."],
  [
    "Stripe session",
    "Server creates a hosted Checkout session from the order total, customer email, and line items.",
  ],
  [
    "Payment UX",
    "Checkout opens Stripe in a new tab and shows a copyable test debit card for demo speed.",
  ],
  [
    "Confirmation",
    "Return URL confirms the Stripe session, marks the order paid, decrements stock, and removes paid items from cart.",
  ],
  [
    "Operations",
    "Admin console shows order status, customer context, totals, and fulfillment progression.",
  ],
];

const apiSurface = [
  [
    "Stripe start",
    "POST /payment/stripe-checkout creates a hosted Checkout session for an existing order.",
  ],
  [
    "Stripe confirm",
    "POST /payment/stripe-confirm verifies session ownership and paid status before updating the order.",
  ],
  [
    "Orders",
    "POST /orders creates pending orders; GET /orders and /orders/{id} expose payment state.",
  ],
  ["Cart", "Paid order quantities are removed from the cart after successful Stripe confirmation."],
  ["Admin", "Admin orders expose payment status and fulfillment updates for operational review."],
  ["Docs", "OpenAPI + Scalar document the payment contract and request/response schemas."],
];

const paymentFlow = [
  ["1", "Cart", "Customer reviews cart totals and proceeds to checkout."],
  ["2", "Pending order", "Shipping and discounts are saved before payment begins."],
  ["3", "Stripe Checkout", "Server creates a test-mode hosted Checkout session."],
  ["4", "Return + verify", "Order page confirms the Stripe session and paid state."],
  ["5", "Receipt + ops", "Receipt shows Stripe verified; admin can continue fulfillment."],
];

export default function CaseStudyPage() {
  return (
    <div>
      <section className="shell py-16 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="mono-label text-[var(--color-primary)]">
              Case study / payment integration
            </p>
            <h1 className="mt-4 max-w-3xl text-[28px] font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              E-commerce platform with payment integration, anchored by Stripe Checkout.
            </h1>
          </div>
          <div className="flex flex-col justify-end gap-8">
            <p className="text-base leading-7 text-slate-400">
              Shopora is built to show complex commerce logic, with the payment path as the main
              proof point: create a pending order, open hosted Stripe Checkout in test mode, verify
              the returned session, mark the order paid, update inventory, clean up the cart, and
              make the result visible to both customer and admin.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <a href={DASHBOARD_URL} className="btn-primary">
                Open dashboard
              </a>
              <a href={DOCS_URL} target="_blank" rel="noreferrer" className="btn-secondary">
                API docs
              </a>
              <a href={REPO_URL} target="_blank" rel="noreferrer" className="btn-secondary">
                GitHub
              </a>
              <a href={PORTFOLIO_URL} target="_blank" rel="noreferrer" className="btn-secondary">
                Mg Wunna website
              </a>
            </div>
          </div>
        </div>

        <div className="mt-14 grid gap-3 border-y border-[var(--color-border)] py-5 sm:grid-cols-4">
          {projectStats.map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="mono-label mt-1 text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <CaseSection
        n="01"
        eyebrow="Portfolio fit"
        title="E-commerce Platform with Payment Integration"
      >
        <div className="grid gap-4 md:grid-cols-3">
          {portfolioSignals.map((signal) => (
            <article key={signal.title} className="premium-panel rounded-md p-5">
              <h3 className="text-lg font-semibold leading-tight">{signal.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">{signal.body}</p>
            </article>
          ))}
        </div>
        <div className="premium-panel mt-4 rounded-md p-5">
          <div className="mono-label text-[var(--color-primary)]">Key features</div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {featureHighlights.map((feature) => (
              <div
                key={feature}
                className="rounded-md border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium leading-6 text-slate-200"
              >
                {feature}
              </div>
            ))}
          </div>
        </div>
      </CaseSection>

      <CaseSection n="02" eyebrow="Problem" title="Most demos stop at the checkout button.">
        <div className="grid gap-6 md:grid-cols-2">
          <p className="case-copy">
            Payment integration is where a commerce demo becomes credible. A storefront can look
            finished while still hiding the hard questions: when is the order created, who owns the
            session, how is payment verified, and what happens to the cart after success?
          </p>
          <p className="case-copy">
            Shopora highlights those details directly. The UI, API, database, and admin console are
            all shaped around proving the payment lifecycle rather than only presenting a product
            grid.
          </p>
        </div>
      </CaseSection>

      <CaseSection n="03" eyebrow="Payment flow" title="The integration has five visible states.">
        <div className="grid gap-3 md:grid-cols-5">
          {paymentFlow.map(([n, title, body]) => (
            <article key={n} className="premium-panel rounded-md p-4">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-[var(--color-primary)] text-sm font-bold text-white">
                {n}
              </div>
              <h3 className="mt-5 text-base font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">{body}</p>
            </article>
          ))}
        </div>
      </CaseSection>

      <CaseSection n="04" eyebrow="Architecture" title="Stripe sits behind the server contract.">
        <div className="premium-panel rounded-lg p-5">
          <ArchitectureDiagram />
        </div>
      </CaseSection>

      <CaseSection n="05" eyebrow="Decisions" title="Four payment choices worth reviewing.">
        <div className="grid gap-4">
          {decisions.map((decision) => (
            <article key={decision.n} className="premium-panel rounded-md p-5">
              <div className="mono-label text-[var(--color-primary)]">Decision {decision.n}</div>
              <h3 className="mt-3 text-lg font-semibold leading-tight">{decision.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">{decision.body}</p>
              <p className="mt-4 border-t border-white/10 pt-4 text-sm leading-6 text-slate-300">
                <strong>Why:</strong> {decision.why}
              </p>
            </article>
          ))}
        </div>
      </CaseSection>

      <CaseSection n="06" eyebrow="API surface" title="The payment contract is documented.">
        <div className="grid gap-3 md:grid-cols-3">
          {apiSurface.map(([group, body]) => (
            <div key={group} className="premium-panel rounded-md p-4">
              <div className="mono-label text-[var(--color-primary)]">{group}</div>
              <p className="mt-3 text-sm leading-6 text-slate-400">{body}</p>
            </div>
          ))}
        </div>
        <a href={DOCS_URL} target="_blank" rel="noreferrer" className="btn-primary mt-8 w-fit">
          Open Scalar API reference <span aria-hidden>→</span>
        </a>
      </CaseSection>

      <CaseSection n="07" eyebrow="Build phases" title="What shipped for payments.">
        <div className="grid gap-4">
          {phases.map(([phase, body], index) => (
            <div
              key={phase}
              className="grid gap-4 border-t border-white/10 py-5 md:grid-cols-[120px_1fr]"
            >
              <div className="mono-label text-[var(--color-primary)]">
                Phase {String(index + 1).padStart(2, "0")}
              </div>
              <div>
                <h3 className="text-lg font-semibold leading-tight">{phase}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </CaseSection>

      <section className="shell py-16">
        <div className="premium-panel grid gap-10 rounded-lg p-6 md:grid-cols-[1fr_0.76fr] md:p-10">
          <h2 className="max-w-xl text-[28px] font-bold leading-tight tracking-tight md:text-4xl">
            Review it like a real product.
          </h2>
          <div className="flex flex-col justify-between gap-7">
            <p className="text-sm leading-7 text-slate-400">
              Start from cart and checkout, complete Stripe test payment, inspect the customer
              receipt, then open the admin console and review the paid order from the operator side.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/" className="btn-secondary">
                Back home
              </Link>
              <a href={DASHBOARD_URL} className="btn-primary">
                Launch dashboard
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function CaseSection({
  n,
  eyebrow,
  title,
  children,
}: {
  n: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="shell py-16">
      <div className="grid gap-8 border-t border-white/10 pt-5 lg:grid-cols-[120px_1fr]">
        <div className="mono-label text-slate-500">{n}</div>
        <div>
          <p className="mono-label text-[var(--color-primary)]">{eyebrow}</p>
          <h2 className="mt-3 max-w-4xl text-[28px] font-bold leading-tight tracking-tight md:text-4xl">
            {title}
          </h2>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </section>
  );
}

function ArchitectureDiagram() {
  return (
    <svg
      viewBox="0 0 960 360"
      role="img"
      aria-label="Shopora architecture diagram"
      className="h-auto w-full"
    >
      <title>
        Shopora payment architecture: website and dashboard call the Hono oRPC API, which owns
        Stripe and MongoDB state
      </title>
      <defs>
        <marker
          id="arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#9CA3AF" />
        </marker>
      </defs>
      {[
        ["Storefront", "Cart + checkout", 30, 105],
        ["Dashboard", "Order review", 30, 235],
        ["API", "Hono + oRPC", 385, 170],
        ["Stripe", "Hosted Checkout", 640, 72],
        ["MongoDB", "Orders + cart", 640, 250],
      ].map(([title, subtitle, x, y], index) => (
        <g key={title}>
          <rect
            x={Number(x)}
            y={Number(y)}
            width="220"
            height="86"
            rx="8"
            fill={index === 2 ? "#4F46E5" : index === 4 ? "#06B6D4" : "#111827"}
            stroke="#1F2937"
            strokeWidth="1.5"
          />
          <text
            x={Number(x) + 110}
            y={Number(y) + 36}
            textAnchor="middle"
            fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
            fontSize="12"
            letterSpacing="1.5"
            fill="#F9FAFB"
          >
            {title}
          </text>
          <text
            x={Number(x) + 110}
            y={Number(y) + 60}
            textAnchor="middle"
            fontFamily="Roboto, system-ui, sans-serif"
            fontWeight="700"
            fontSize="16"
            fill={index === 2 || index === 4 ? "#F9FAFB" : "#9CA3AF"}
          >
            {subtitle}
          </text>
        </g>
      ))}
      <line
        x1="250"
        y1="148"
        x2="385"
        y2="198"
        stroke="#9CA3AF"
        strokeWidth="1.5"
        markerEnd="url(#arrow)"
      />
      <line
        x1="250"
        y1="278"
        x2="385"
        y2="216"
        stroke="#9CA3AF"
        strokeWidth="1.5"
        markerEnd="url(#arrow)"
      />
      <line
        x1="605"
        y1="188"
        x2="640"
        y2="124"
        stroke="#9CA3AF"
        strokeWidth="1.5"
        markerEnd="url(#arrow)"
      />
      <line
        x1="605"
        y1="222"
        x2="640"
        y2="282"
        stroke="#9CA3AF"
        strokeWidth="1.5"
        markerEnd="url(#arrow)"
      />
    </svg>
  );
}
