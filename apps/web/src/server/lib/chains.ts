// Supported EVM networks. `alchemySlug` is what the Alchemy Portfolio API and
// RPC endpoints expect. Add a network here and it flows through the whole app.

export type ChainConfig = {
  chainId: number;
  alchemySlug: string;
  name: string;
  nativeSymbol: string;
  nativeName: string;
  nativeDecimals: number;
  nativeAssetId: string; // groups the native coin across chains (ETH on L2s → one)
};

export const CHAINS: ChainConfig[] = [
  {
    chainId: 1,
    alchemySlug: "eth-mainnet",
    name: "Ethereum",
    nativeSymbol: "ETH",
    nativeName: "Ether",
    nativeDecimals: 18,
    nativeAssetId: "native:eth",
  },
  {
    chainId: 8453,
    alchemySlug: "base-mainnet",
    name: "Base",
    nativeSymbol: "ETH",
    nativeName: "Ether",
    nativeDecimals: 18,
    nativeAssetId: "native:eth",
  },
  {
    chainId: 42161,
    alchemySlug: "arb-mainnet",
    name: "Arbitrum",
    nativeSymbol: "ETH",
    nativeName: "Ether",
    nativeDecimals: 18,
    nativeAssetId: "native:eth",
  },
  {
    chainId: 10,
    alchemySlug: "opt-mainnet",
    name: "Optimism",
    nativeSymbol: "ETH",
    nativeName: "Ether",
    nativeDecimals: 18,
    nativeAssetId: "native:eth",
  },
  {
    chainId: 137,
    alchemySlug: "polygon-mainnet",
    name: "Polygon",
    nativeSymbol: "POL",
    nativeName: "Polygon",
    nativeDecimals: 18,
    nativeAssetId: "native:pol",
  },
];

export const CHAIN_BY_SLUG = new Map(CHAINS.map((c) => [c.alchemySlug, c]));
export const CHAIN_BY_ID = new Map(CHAINS.map((c) => [c.chainId, c]));
export const ALL_SLUGS = CHAINS.map((c) => c.alchemySlug);

/** Map a list of chainIds to Alchemy slugs, defaulting to all supported. */
export function slugsForChainIds(chainIds?: number[]): string[] {
  if (!chainIds || chainIds.length === 0) return ALL_SLUGS;
  return chainIds
    .map((id) => CHAIN_BY_ID.get(id)?.alchemySlug)
    .filter((s): s is string => Boolean(s));
}
