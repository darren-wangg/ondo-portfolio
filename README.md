# Ondo · Multi-Chain Portfolio Explorer

A unified, multi-chain view of a user's token holdings. Connect or watch any
number of EVM addresses; balances are fetched across networks, normalized so the
same asset on different chains is treated as one, and presented in a table you
can regroup by **token**, **network**, or **wallet**.

Single **Next.js 15** app (App Router) — UI plus API **Route Handlers** in one
Vercel-native deployment. Data comes from the **Alchemy Portfolio API**, with a
**mock provider** so the app runs with no credentials.

## Stack

| Concern        | Choice                                                           |
| -------------- | ---------------------------------------------------------------- |
| Framework      | Next.js 15 (App Router) · React 19 · TypeScript                  |
| Wallet connect | RainbowKit + wagmi + viem                                        |
| Data           | Alchemy Portfolio API (`tokens/by-address`, `getAssetTransfers`) |
| Server logic   | Next.js Route Handlers (`src/app/api/*`) + Zod validation        |
| Client state   | Zustand (persisted to localStorage) · TanStack Query             |
| UI             | Tailwind v4 · next-themes · Framer Motion                        |
| Tests / format | Vitest · Prettier                                                |

## Getting started

```bash
pnpm install
cp .env.example apps/web/.env.local   # optional — runs on mock data if unset

pnpm dev                              # http://localhost:3000
```

With **no env vars**, the API serves realistic mock data (and the UI shows a
`mock` badge). Add an Alchemy key to switch to live on-chain data:

```bash
# apps/web/.env.local
ALCHEMY_API_KEY=...                       # server-side; live data when present
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=...  # client-side; enables WalletConnect
```

- Alchemy key (free): https://dashboard.alchemy.com
- WalletConnect/Reown project id (free): https://dashboard.reown.com
  (without it, only injected wallets like MetaMask are offered)

## How it works

1. **Collect addresses** — each wallet connect captures one address; a "watch"
   input adds read-only addresses. Tracked wallets live in a Zustand store
   persisted to localStorage.
2. **Fetch** — `POST /api/portfolio` fans out across wallets with
   `Promise.allSettled` (one failing wallet/chain doesn't sink the rest) and
   returns a flat, normalized `Position[]` plus per-wallet `sources` status.
3. **Normalize** — each token gets an `assetId` group key: curated registry →
   CoinGecko id, native coin → shared id (ETH across L2s), else `symbol@decimals`.
4. **Group & render** — the client does a pure `groupBy` (token/network/wallet)
   with BigInt balance sums, so switching grouping never refetches.

See `docs/flow.pdf` and `docs/system-design.pdf` for diagrams.

## API

| Route                   | Description                                              |
| ----------------------- | -------------------------------------------------------- |
| `POST /api/portfolio`   | `{ wallets: [{address,label?}], chainIds? }` → portfolio |
| `GET /api/transactions` | `?address=0x…` → recent transfers (stretch)              |
| `GET /api/health`       | liveness + active provider mode                          |

## Scripts

| Command             | What it does                     |
| ------------------- | -------------------------------- |
| `pnpm dev`          | Run the app (port 3000)          |
| `pnpm build`        | Production build                 |
| `pnpm test`         | Vitest unit tests                |
| `pnpm typecheck`    | `tsc --noEmit` across workspaces |
| `pnpm format`       | Prettier write                   |
| `pnpm format:check` | Prettier check                   |

## Project layout

```
apps/web/src/
├── app/
│   ├── api/{portfolio,transactions,health}/route.ts   # server endpoints
│   ├── page.tsx                                        # explorer UI
│   └── providers.tsx                                   # wagmi/query/theme
├── server/                # framework-agnostic backend logic
│   ├── lib/{chains,tokens,amount}.ts
│   ├── providers/{alchemy,mock,index}.ts               # swappable data source
│   ├── services/portfolio.ts                           # allSettled aggregation
│   └── validation.ts                                   # Zod schemas
├── features/portfolio/{grouping.ts,PortfolioTable.tsx}
├── components/            # WalletBar, states, ThemeToggle
├── hooks/usePortfolio.ts
└── store/wallets.ts       # Zustand + persist
```

## Deploying to Vercel

One project. Set **Root Directory** to `apps/web`, framework auto-detects as
Next.js, install via the repo's `pnpm-lock.yaml`. Add env vars `ALCHEMY_API_KEY`
and `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`. No database or separate API service.

## Known limitations / fast-follows

- Transaction history: API + provider are built; the UI panel is not yet wired.
- Alchemy paginates `tokens/by-address` (`pageKey`) only when a wallet holds
  > 100 tokens — we fetch the first page.
- Stretch not built: portfolio value-over-time chart, table pagination.
