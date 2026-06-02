# CLAUDE.md

Guidance for working in this repo. Keep it current as the architecture evolves.

## What this is

**Multi-Chain Portfolio Explorer** — a single Next.js 15 (App Router) app that
shows a unified, normalized view of EVM token holdings across wallets and
networks. UI + API live in one app (`apps/web`); the API is Next.js **Route
Handlers**, not a separate service. There is **no database** (tracked wallets are
client-side, persisted to localStorage).

## Architecture (the mental model)

```
Wallet connect / watch input  →  Zustand store (persist: localStorage)
        →  POST /api/portfolio  →  buildPortfolio (Promise.allSettled per wallet)
        →  PortfolioProvider (Alchemy live | mock)  →  normalize → Position[]
        →  client groupPositions(token|network|wallet)  →  table
```

- **Server logic is framework-agnostic** and lives in `apps/web/src/server/`.
  Route Handlers in `src/app/api/*/route.ts` are thin wrappers: validate (Zod) →
  call a service → `NextResponse.json`. Keep business logic out of the handlers.
- **Flat `Position[]` is the contract.** The API returns one record per
  (wallet × token). Grouping is a pure client-side `groupBy` over that list, so
  adding/switching groupings never touches the server. Don't aggregate on the
  server.
- **Provider abstraction:** `src/server/providers/` exposes `PortfolioProvider`.
  `getProvider()` returns the Alchemy provider when `ALCHEMY_API_KEY` is set,
  else the mock. Swap data sources by adding a provider — nothing else changes.

## Conventions

- **Money is BigInt.** Raw balances are integer base units sent as **strings**;
  parse with `BigInt(...)`. Sum balances as BigInt (only within one set of
  decimals). Convert to a JS number for display/USD **only at the leaf** via
  `lib/amount.ts` (server) / `lib/format.ts` (client). Never `Number(rawBalance)`
  on un-scaled values — they overflow `MAX_SAFE_INTEGER`.
- **Token identity:** canonical on-chain id is `(chainId, address)`. The
  cross-chain group key `assetId` comes from `normalizeAsset()` in
  `server/lib/tokens.ts`: curated registry → native id → `sym:SYMBOL@decimals`
  → `chainId:address`. Symbol alone is never the key.
- **Partial failure is first-class.** Per-wallet fetches use `Promise.allSettled`;
  failures are reported in `response.sources[]`, surfaced by `PartialFailureBanner`.
- Imports in `src/server/*` and `src/*` use no file extensions (Bundler
  resolution). `@/` maps to `src/`.
- Run `pnpm format` (Prettier) before committing; `pnpm typecheck` and
  `pnpm test` should pass.

## Common changes

- **Add a network:** append to `CHAINS` in `server/lib/chains.ts` (chainId +
  Alchemy slug + native coin) and add the chain to `lib/wagmi.ts`. It flows
  through fetching, normalization, and grouping automatically.
- **Make a token group across chains:** add its `(chainId,address) → assetId`
  rows to `REGISTRY` in `server/lib/tokens.ts`.
- **Swap/extend the data source:** implement `PortfolioProvider`
  (`server/providers/types.ts`) and wire it in `server/providers/index.ts`.
- **Add a grouping:** extend `GroupBy` + the key selector in
  `features/portfolio/grouping.ts`. No API change.

## Commands

```bash
pnpm dev          # http://localhost:3000
pnpm build        # production build (also typechecks)
pnpm test         # Vitest (server normalization + portfolio service)
pnpm typecheck
pnpm format
```

## Env

`apps/web/.env.local` (gitignored). Both optional — app runs on mock data with
neither:

- `ALCHEMY_API_KEY` — server-side; presence flips provider to live.
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` — client-side; enables WalletConnect.

## Gotchas

- The mock provider throws for any address containing `"fail"` (used to demo
  partial failure) — that string is intentionally allowed past validation.
- Alchemy `tokenBalance` is a **hex string**; native coins have
  `tokenAddress: null` and null metadata (synthesized from chain config).
- Heavy spam filtering in the Alchemy provider drops unpriced, unknown ERC-20s.
- Tests run in the jsdom env but server modules are environment-agnostic.

## Status / not yet built

- Transaction history: `GET /api/transactions` + provider method exist; the UI
  panel is not wired.
- Stretch not built: value-over-time chart, table pagination.
