# AGENTS.md

Guidance for Codex working in this template repo.

## What This Is

Single-project monorepo template for vibe-coded demo apps. Three apps + one shared package.

| Path | Stack | Port | Deploy |
|------|-------|------|--------|
| `apps/server` | Hono + oRPC + Mongoose (Bun) | 3000 | Render (staging) / Docker on VPS (prod) |
| `apps/website` | Next.js 15 SSG | 3001 | Cloudflare Pages |
| `apps/dashboard` | Vite + React 19 | 3002 | Cloudflare Pages |
| `packages/api` | `@template/api` (oRPC contract + zod schemas) | — | workspace consumer |
| `packages/configs` | `@template/configs` (ports, cors, env) | — | workspace consumer |

No turbo. No custom CLI. Pure Bun workspaces + `package.json` scripts.

## Design Reference

Use root `DESIGN.md` for UI work across `apps/website` and `apps/dashboard`. It is the Shopify-inspired e-commerce platform design reference from VoltAgent's Awesome DESIGN.md collection (`https://github.com/VoltAgent/awesome-design-md`, Shopify entry via `https://getdesign.md/shopify/design-md`).

Keep Shopora's UI dark-first, commerce-focused, and operationally sharp: deep forest/teal-black surfaces, high-contrast white type, restrained neon green accents, product imagery, dense but readable admin tables, and pill-shaped primary actions. Avoid generic purple/blue SaaS gradients unless they are being intentionally replaced.

## Commands

```bash
bun install              # install deps + lefthook hooks
bun run dev              # all 3 apps parallel
bun run dev:server       # one app
bun run dev:website
bun run dev:dashboard
bun run build            # all builds
bun run build:<app>      # one build
bun run start:server     # run built server (bun dist/index.js)
bun run typecheck        # tsc --noEmit, all workspaces
bun run lint / lint:fix  # biome
bun run format / format:check
bun run docker:up        # local mongo + redis + server
bun run docker:down
bun run docker:logs
bun run docker:build
```

Per-app filter: `bun --filter <name> <script>`.

## Repo Layout

```
template/
  apps/
    server/                # Hono + oRPC + Mongoose
      src/index.ts         # entry; uses @template/configs
      Dockerfile
    website/               # Next.js 15
    dashboard/             # Vite React
  packages/
    configs/               # @template/configs (ports/cors/env)
  .env.example             # committed scaffold
  .env.development         # gitignored — local dev (Bun auto-loads)
  .env.production          # gitignored — VPS server
  docker-compose.yml             # local dev infra (server + mongo + redis)
  docker-compose.production.yml  # VPS prod (server + mongo + redis + traefik + watchtower)
  render.yaml                    # Render staging blueprint
  .github/workflows/
    staging-deploy.yml
    production-deploy.yml
```

## Workspace Package Naming

All shared packages use `@template/*` namespace.

- `packages/configs` → `@template/configs`
- Subpath imports: `@template/configs/ports`, `@template/configs/cors`, `@template/configs/env`
- No barrel (no `index.ts`). Add subpath to `exports` map in `packages/configs/package.json` when adding a new module.

When forking this template for a real product, search-replace `@template/` → `@<product>/` and update `packages/configs/package.json` `name`.

## Deploy

### Staging — Render + Cloudflare Pages

Trigger: push to `staging` branch.

- `apps/server` → Render via `RENDER_DEPLOY_HOOK_URL`
- `apps/website` → Cloudflare Pages project `shopora-website` with `--branch=staging`
- `apps/dashboard` → Cloudflare Pages project `shopora-dashboard` with `--branch=staging`

GitHub secrets: `RENDER_DEPLOY_HOOK_URL`, `STAGING_API_URL`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.
GitHub variables: `STAGING_WEBSITE_URL`, `STAGING_DASHBOARD_URL`.

Render env (dashboard, `sync: false` in `render.yaml`): `MONGO_URI`, `JWT_SECRET`, `REDIS_URL`.

### Production — Docker on VPS + Cloudflare Pages

Trigger: push to `production` branch.

- `apps/server` → builds Docker image → pushes to `ghcr.io/<owner>/template-server:latest` → watchtower on VPS pulls every 5 min
- `apps/website` + `apps/dashboard` → Cloudflare Pages projects `shopora-website` / `shopora-dashboard`

GitHub secrets: `PRODUCTION_API_URL`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`. (GHCR uses built-in `GITHUB_TOKEN`.)
GitHub variables: `PRODUCTION_WEBSITE_URL`, `PRODUCTION_DASHBOARD_URL`.

VPS env (`.env.production` on host alongside compose file): `DOMAIN`, `JWT_SECRET`, `MONGO_USER`, `MONGO_PASSWORD`, `REDIS_PASSWORD`, `ACME_EMAIL`, `GITHUB_OWNER`.

VPS bootstrap: `docker login ghcr.io -u <user> -p <PAT>` once so `~/.docker/config.json` exists for watchtower auth. Then `docker compose --env-file .env.production -f docker-compose.production.yml up -d`.

## Git Hooks

Lefthook auto-installed via `bun install` → `prepare`.

| Hook | Runs |
|------|------|
| pre-commit | biome format (staged) + `bun run lint` + `bun run typecheck` |
| pre-push | `bun run build` + lint + typecheck |

Bypass: `git commit --no-verify` (sparingly — block-no-verify hook may reject it at harness level).

## Gotchas

- Workspace package namespace is `@template/*`. When forking, rename to `@<product>/*`.
- Server runs Bun directly. `build` script bundles for `start`; runtime needs no build.
- Frontends are `website` + `dashboard` only. No native-app, no native-pwa, no crons in this template.
- `docker-compose.yml` has dev fallback secrets (`devpassword`, `dev-secret-...`). Local only — never deploy. Production compose has no `:-` fallbacks; missing env fails loud.
- Watchtower polls every 5 min; server redeploy is not instant. Acceptable for demo. For instant rollout add SSH job that runs `docker compose pull && docker compose up -d`.
- `.Codex/`, `.cursor/`, `.windsurf/`, `.paul/`, `.ideas/`, `Codex.local.md`, etc. are gitignored. Each dev configures own AI tooling locally. Project-level `AGENTS.md` (this file) IS committed.
- Rate limiter (server): in production, requests with no `x-real-ip` / `x-forwarded-for` get 400. Traefik always sets the header — only direct port hits trigger rejection. In dev, all no-IP requests share key `dev:no-ip`.
- CORS in production reads `CORS_ORIGINS` env (comma-separated) and filters through `URL` constructor with `https:` enforcement. Dev allows localhost + private network ranges.

## When Forking for a Real Product

1. Root `package.json` `"name"` → product name.
2. `packages/configs/package.json` `"name"` → `@<product>/configs`.
3. Search-replace `@template/` → `@<product>/` across `apps/*`.
4. `apps/server/src/index.ts`: update OpenAPI title.
5. `docker-compose.yml`: Mongo db name `template` → `<product>`.
6. `production-deploy.yml`: image name `template-server` → `<product>-server`.
7. `cp .env.example .env.development` and fill values.
8. Set GitHub secrets, create Cloudflare Pages projects, create Render service.
9. Push.
