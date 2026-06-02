# Ondo

Minimal full-stack starter. A pnpm monorepo wiring together:

| Workspace     | Stack                                 | Dev port |
| ------------- | ------------------------------------- | -------- |
| `apps/web`    | Next.js 15 · React 19 · TypeScript    | 3000     |
| `apps/api`    | Node · Express 4 · TypeScript (`tsx`) | 4000     |
| `packages/db` | Prisma 6 · PostgreSQL (shared client) | —        |

Data flow: **web → api (HTTP) → db**. The web app never touches Postgres directly.

## Prerequisites

- Node `>=20` (`.nvmrc` pins 24)
- pnpm `10`
- A PostgreSQL database

## Getting started

```bash
pnpm install
cp .env.example .env          # then edit DATABASE_URL

pnpm db:generate              # generate the Prisma client
pnpm db:migrate               # create the schema in your database

pnpm dev                      # runs web (:3000) and api (:4000) together
```

Open http://localhost:3000 — the homepage renders the API's `/api/health`
status, which in turn pings Postgres.

## Scripts (run from repo root)

| Command             | What it does                              |
| ------------------- | ----------------------------------------- |
| `pnpm dev`          | Run web + api in parallel                 |
| `pnpm build`        | Build all apps                            |
| `pnpm test`         | Run every workspace's test suite (Vitest) |
| `pnpm typecheck`    | Typecheck every workspace                 |
| `pnpm format`       | Format the repo with Prettier             |
| `pnpm format:check` | Check formatting without writing          |
| `pnpm db:generate`  | `prisma generate`                         |
| `pnpm db:migrate`   | `prisma migrate dev`                      |
| `pnpm db:studio`    | Open Prisma Studio                        |

## Environment variables

| Variable              | Used by       | Notes                                 |
| --------------------- | ------------- | ------------------------------------- |
| `DATABASE_URL`        | `packages/db` | Postgres connection string            |
| `PORT`                | `apps/api`    | API listen port (default 4000)        |
| `NEXT_PUBLIC_API_URL` | `apps/web`    | Base URL the web app calls the API at |

## Deploying to Vercel

The **web app** is the Vercel-native piece. Create a Vercel project from this
repo and set:

- **Root Directory:** `apps/web` (enable "Include files outside the root
  directory" so the workspace install resolves `packages/*`).
- **Framework Preset:** Next.js (auto-detected).
- **Install Command:** `pnpm install` (auto-detected from `pnpm-lock.yaml`).
- **Environment variable:** `NEXT_PUBLIC_API_URL` → your deployed API URL.

The **Express API** and **Postgres** are not part of the Next.js deployment.
Options:

- Deploy `apps/api` to a Node host (Railway, Render, Fly.io) with start command
  `pnpm --filter @ondo/api start`, and run `pnpm --filter @ondo/db deploy`
  (`prisma migrate deploy`) on release.
- Or port the Express routes to Next.js Route Handlers (`apps/web/src/app/api/*`)
  to ship everything on Vercel as one deployment.

Use a managed Postgres (Vercel Postgres, Neon, Supabase) and set `DATABASE_URL`
in each service's environment.
