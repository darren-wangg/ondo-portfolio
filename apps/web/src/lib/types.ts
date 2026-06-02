// Mirror of the response types in src/server/types.ts.

export type Position = {
  walletAddress: string;
  walletLabel: string;
  chainId: number;
  networkName: string;
  tokenAddress: string | null;
  assetId: string;
  symbol: string;
  name: string;
  decimals: number;
  logoUrl: string | null;
  rawBalance: string;
  priceUsd: number | null;
  valueUsd: number | null;
};

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
