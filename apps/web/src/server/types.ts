// Shared domain types for the portfolio server logic. The client mirrors the
// response types in src/lib/types.ts (kept in sync by hand — small surface).

export type WalletInput = { address: string; label?: string };

/** One (wallet × token) holding, already normalized. Balances stay as integer
 *  base units in a string so both sides can use BigInt without precision loss. */
export type Position = {
  walletAddress: string;
  walletLabel: string;
  chainId: number;
  networkName: string;
  tokenAddress: string | null; // null = native coin (ETH, POL)
  assetId: string; // cross-chain group key — see lib/tokens.ts
  symbol: string;
  name: string;
  decimals: number;
  logoUrl: string | null;
  rawBalance: string; // integer base units
  priceUsd: number | null;
  valueUsd: number | null; // null when price unknown
};

/** Per-wallet fetch outcome so the UI can show partial-failure state. */
export type SourceStatus = {
  walletAddress: string;
  walletLabel: string;
  status: "ok" | "failed";
  count?: number;
  error?: string;
};

export type PortfolioResponse = {
  positions: Position[];
  sources: SourceStatus[];
  mode: "live" | "mock";
};

export type TxItem = {
  hash: string;
  chainId: number;
  networkName: string;
  direction: "in" | "out" | "self";
  counterparty: string | null;
  asset: string | null;
  value: number | null;
  category: string;
  timestamp: string | null;
};
