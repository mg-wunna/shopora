# Shopora — Fullstack E-commerce Demo

A complete, end-to-end e-commerce demo built on top of the template scaffold.
Designed as a portfolio piece to demonstrate full-stack craft: typed API
contract, JWT auth, MongoDB persistence, Stripe test payments, and a polished
dark-themed storefront and admin dashboard.

## Stack

| Layer       | Tech                                              |
| ----------- | ------------------------------------------------- |
| Backend     | Bun + Hono + oRPC + Mongoose + JWT                |
| Storefront  | Next.js 15 (SSG) + Tailwind v4 + React 19         |
| Admin       | Vite + React 19 + react-router + Tailwind v4      |
| Shared      | `@template/api` (zod schemas + oRPC contract)     |
| Database    | MongoDB                                           |

The same `oRPC` contract types flow into both frontends through the
`@template/api` workspace package, so types stay perfectly in sync between
backend handlers and UI calls.

## Features

### Storefront (`apps/website` · http://localhost:3001)

- Beautiful dark-themed home with hero, category grid, featured products, latest arrivals
- Product listing with search, category filter, max-price, sort, pagination
- Product detail with image gallery, quantity selector, stock indicator
- Cart (server-backed, persists across devices)
- Checkout with shipping address + discount codes
- Stripe Checkout test-mode payment with copyable test debit card
- Order history and tracking with status timeline
- Auth (register/login), JWT stored in localStorage

### Admin Dashboard (`apps/dashboard` · http://localhost:3002)

- Overview with revenue chart (last 7 days), top products, recent orders
- Products CRUD with category, price, stock, image URLs, featured flag
- Orders board with status filters and inline status updates
- Users directory
- Discount code generator (with expiry)
- Admin-only access (role check on login)

### Backend (`apps/server` · http://localhost:3000)

- REST API at `/v1/*` (OpenAPI spec at `/openapi.json`, docs at `/docs`)
- RPC endpoints at `/rpc/*` for type-safe clients
- JWT auth middleware via `Authorization: Bearer <token>`
- Role-based access control (user / admin)
- Mongoose models for User, Product, Category, Cart, Order, Discount
- Aggregations for analytics (revenue, top products, daily revenue)
- WebSocket echo at `/ws`, health check at `/health`

## Getting started

### 1. Bring up MongoDB

```bash
bun run docker:up    # starts mongo + redis (compose)
```

The dev defaults match `.env.development`:
`mongodb://admin:password@localhost:27017/shopora?authSource=admin`

### 2. Seed the database

```bash
bun run seed
```

Creates:
- 6 categories
- 20 products with Unsplash imagery
- 2 demo users:
  - `admin@shopora.dev` / `admin123` (admin)
  - `demo@shopora.dev` / `password` (user)
- 3 discount codes: `WELCOME10`, `SUMMER20`, `VIP30`

### 3. Start everything in dev

```bash
bun run dev          # starts server + website + dashboard in parallel
```

Or individually:

```bash
bun run dev:server
bun run dev:website
bun run dev:dashboard
```

### 4. Open the apps

| URL                              | What it is                |
| -------------------------------- | ------------------------- |
| http://localhost:3001            | Storefront                |
| http://localhost:3002            | Admin dashboard           |
| http://localhost:3000/docs       | API reference (Scalar)    |
| http://localhost:3000/openapi.json | OpenAPI spec            |

## Demo flow

1. Visit the **storefront** and click "Sign in", use `demo@shopora.dev / password`.
2. Browse `/products`, add a few items to your cart.
3. Go to `/checkout`, paste address, try `WELCOME10` for 10% off.
4. Pay with card `4242 4242 4242 4242` → success. Pay with anything ending in `0` → declined.
5. Visit `/orders` to see your order with the status timeline.
6. Open the **admin dashboard** in another tab, log in with `admin@shopora.dev / admin123`.
7. Watch the order appear in `Orders`, change status to `shipped` → reflects on the storefront.
8. Try creating a product or a discount code from the dashboard.

## Project layout

```
shopora/
  apps/
    server/             Hono + oRPC + Mongoose API
      src/
        index.ts        Hono app, CORS, rate limit, OpenAPI, oRPC handlers
        router.ts       All endpoint handlers (auth, products, cart, orders, admin)
        models.ts       Mongoose schemas
        auth.ts         JWT helpers, bcrypt password hashing
        serialize.ts    DB doc → wire schema converters
        seed.ts         Idempotent seed script
    website/            Next.js 15 storefront (SSG)
      src/
        app/            Pages (home, products, product, cart, checkout, orders, order, login, register)
        components/     Header, Footer, ProductCard, Providers (Auth + Cart + Toast)
        lib/api.ts      Fetch wrapper with auth header
    dashboard/          Vite + React admin
      src/
        pages/          Overview, Products, Orders, Users, Discounts, Login
        components/     Sidebar, Toast
        lib/auth.tsx    Admin AuthProvider
        lib/api.ts      Fetch wrapper
  packages/
    api/                @template/api — zod schemas + oRPC contract (shared types)
    configs/            @template/configs — ports, cors, env helpers
```

## Demo accounts

| Role  | Email                  | Password   |
| ----- | ---------------------- | ---------- |
| Admin | admin@shopora.dev      | admin123   |
| User  | demo@shopora.dev       | password   |

## Discount codes

| Code       | Off  | Expires      |
| ---------- | ---- | ------------ |
| WELCOME10  | 10%  | 90 days      |
| SUMMER20   | 20%  | 60 days      |
| VIP30      | 30%  | 30 days      |

## Stripe test payment

Checkout creates a pending order first, then starts a Stripe Checkout session
through `POST /v1/payment/stripe-checkout`. After Stripe redirects back, the
order page confirms the session through `POST /v1/payment/stripe-confirm`,
marks the order `paid`, decrements product stock, and removes the paid items
from the user's cart.

## Notes

- All three apps pass `tsc --noEmit` and `bun run build` cleanly.
- Type contract lives in `packages/api`, consumed by all three workspaces.
- Stripe runs in test mode. Email delivery and Cloudflare deployment are not
  wired for local demo use.
- Frontend uses no UI framework dependencies beyond Tailwind v4. All components
  are hand-rolled to demonstrate styling/UX craft.
