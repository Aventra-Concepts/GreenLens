# GreenLens – AI Plant Intelligence Platform

GreenLens is a full-stack TypeScript application that turns plant photos into actionable insights. It combines AI-powered plant identification, garden automation dashboards, subscription features, and rich admin tooling. The project aims to be deployable on **Cloudflare Pages/Workers** with **Supabase Postgres** as the primary data store while keeping the data-access layer portable.

## 🌱 Feature Highlights

- **AI Plant ID + Disease Detection** – Upload images, let Plant.id + OpenAI summarize care recommendations.
- **Personalized Care Plans** – Hybrid of generated insights and curated catalog content.
- **My Garden & Monitoring Suite** – Track plants, schedules, inventory, expenses, achievements, and analytics dashboards.
- **Subscription & Commerce** – Stripe/Razorpay integrations, ebook marketplace, author onboarding.
- **Admin Consoles** – HR, student programs, social media automation, pricing controls, premium features, etc.
- **Security & Observability** – Layered middleware stack (rate limiting, sanitization, caching), activity tracking, scheduled background services.

## 🧱 Current Architecture

| Layer | Implementation |
| --- | --- |
| Frontend | React 18, Vite, TypeScript, Tailwind, shadcn/ui, Wouter, TanStack Query |
| Backend | Express 4 (ESM), TypeScript, Drizzle ORM (Postgres dialect) |
| Database | Supabase Postgres (via Drizzle) – environment-driven provider abstraction |
| Auth | Sessions via `express-session`, Passport (Local/Google/Facebook/GitHub) |
| Build Tooling | Vite for client, esbuild bundle for server |
| Deployment Target | Cloudflare Pages (static/client) + Cloudflare Workers/Pages Functions (API) using Node compatibility |

> **Note:** The README reflects the current codebase (React/Vite + Express/Drizzle). Legacy references to Next.js/Prisma/Replit have been removed.

## 🗂️ Repository Layout (high level)

- `client/` – Vite React SPA (admin dashboards, public site, etc.)
- `server/` – Express app, routes broken down by domain (HR, garden, ebooks, etc.)
- `shared/` – Drizzle schema + shared types
- `migrations/` – Drizzle SQL migrations
- `drizzle.config.ts` – CLI config (uses `SUPABASE_DB_URL` when available)
- `env.example` – Reference environment variables

## ⚙️ Environment Variables

1. Copy `env.example` to `.env` locally (do **not** commit `.env`).
2. Populate:
   - `SUPABASE_DB_URL` + `SUPABASE_SERVICE_ROLE_KEY` (primary DB access)
   - Secrets for session (`SESSION_SECRET`), JWT, email transports, payment gateways, OAuth providers, AI APIs, etc.
3. When deploying to Cloudflare, create Wrangler secrets mirroring the same names (e.g., `CF_SUPABASE_DB_URL`).

Refer to `env.example` for the exhaustive list grouped by concern.

## 🗃️ Supabase Setup

1. **Create Supabase project** → copy the connection string.
2. In `.env`, set `SUPABASE_DB_URL=postgresql://...` and optional `SUPABASE_SERVICE_ROLE_KEY`.
3. Run migrations via Drizzle:

   ```bash
   # Push schema definitions to Supabase
   SUPABASE_DB_URL="postgresql://..." npm run db:push
   ```

4. Update `DB_PROVIDER=supabase` (default). Future providers can be added via the same abstraction.
5. In production (Cloudflare), store DB credentials as Wrangler secrets (e.g., `wrangler secret put CF_SUPABASE_DB_URL`).

## 🛠️ Development Workflow

```bash
git clone https://github.com/<your-org>/greenlens.git
cd GreenLens
npm install

# Start the Express API + Vite client together
npm run dev

# Type checking / builds
npm run check     # tsc --noEmit
npm run build     # vite build + esbuild server bundle
npm run start     # runs dist/index.js (production)
```

## 🧪 Testing & Quality Gates

- **Lint/Type check:** `npm run check` (tsc) and (planned) ESLint script.
- **Security:** `npm audit --production` (CI surfaces advisories; some require upstream fixes).
- **CI/CD:** GitHub Actions workflow will install deps, run type check/lint, build client/server, and optionally run tests before deploy triggers.

## ☁️ Cloudflare Deployment Overview

1. **Static Client (Pages):**
   - `npm run build` outputs to `dist/public` for the SPA. Configure Pages to serve that directory.
2. **API (Workers / Pages Functions):**
   - Use Wrangler with Node compatibility to run the Express server bundle (`dist/index.js`).
   - Bind environment variables/secrets (Supabase keys, OAuth creds) via `wrangler.toml` + `wrangler secret put`.
   - Optionally configure Hyperdrive if using external Postgres instead of direct Supabase connections.
3. **GitHub Actions:** A deploy workflow can run `npm ci`, `npm run build`, then `wrangler pages deploy` (client) and `wrangler deploy` (API) with Cloudflare tokens stored as repo secrets.

Detailed deployment instructions will live in `/docs/deployment/cloudflare.md` (to be added) covering Node-compat flags, binding names, and CI integration.

## 🔐 Security Considerations

- The Express stack already layers security middleware (helmet-like headers, rate limiting, XSS/SQL sanitizers, API caching) – see `server/middleware/`.
- Session data is currently cookie-based with `express-session`. For Workers deployment, plan to migrate sessions to a KV/Durable Object or Supabase to avoid in-memory stores.
- Sensitive operations depend on env vars. Do not check secrets into version control; rely on `.env` locally and Wrangler secrets / GitHub Actions secrets in production.

## 📝 Roadmap / TODO

- [ ] Finalize Supabase-aware DB client factory + provider abstraction (in progress).
- [ ] Remove deprecated demo artifacts (cookie dumps, replit scripts) once confirmed unneeded.
- [ ] Add Cloudflare deployment docs + Wrangler config.
- [ ] Introduce ESLint/Prettier config for consistent linting.
- [ ] Address outstanding npm audit advisories (requires upstream bumps or package swaps).

## 🤝 Contributing

1. Fork & clone the repo.
2. Create a feature branch (`git checkout -b feature/my-change`).
3. Run `npm run dev` + `npm run check` locally.
4. Commit with context (`git commit -m "feat: add garden sensors"`).
5. Push and open a PR describing the change and any required env/config updates.

---

Need help or want to propose an improvement? Open an issue or start a discussion in the repo. GreenLens is evolving quickly, so keep an eye on the roadmap for upcoming DB abstraction, Cloudflare deployment scripts, and test coverage plans.
