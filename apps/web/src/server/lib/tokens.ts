// Token identity / normalization.
//
// Spec: "the same asset on different networks must be treated as one — symbol
// alone isn't enough." Layered strategy:
//   1. Canonical on-chain identity is always (chainId, contractAddress).
//   2. The cross-chain GROUP KEY (assetId) is resolved in priority order:
//      a. curated registry  (chainId,address) -> canonical id  [USDC, USDT, ...]
//      b. native coin        -> chain.nativeAssetId            [ETH across L2s]
//      c. symbol + decimals  -> "sym:USDC@6"                   [unknown but named]
//      d. last resort        -> "chainId:address"              [treat as unique]
//
// (c) keys on decimals too so two unrelated tokens that share a symbol but differ
// in decimals don't get merged.

/** Curated cross-chain registry, keyed by `${chainId}:${address.toLowerCase()}`. */
const REGISTRY: Record<string, string> = {
  // USDC
  "1:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": "usd-coin",
  "8453:0x833589fcd6edb6e08f4c7c32d4f71b1566da3dff": "usd-coin",
  "42161:0xaf88d065e77c8cc2239327c5edb3a432268e5831": "usd-coin",
  "10:0x0b2c639c533813f4aa9d7837caf62653d08d5890": "usd-coin",
  "137:0x3c499c542cef5e3811e1192ce70d8cc03d5c3359": "usd-coin",
  // USDT
  "1:0xdac17f958d2ee523a2206206994597c13d831ec7": "tether",
  "42161:0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9": "tether",
  "10:0x94b008aa00579c1307b0ef2c499ad98a8ce58e58": "tether",
  "137:0xc2132d05d31c914a87c6611c10748aeb04b58e8f": "tether",
  // DAI
  "1:0x6b175474e89094c44da98b954eedeac495271d0f": "dai",
  "10:0xda10009cbd5d07dd0cecc66161fc93d7c9000da1": "dai",
  "42161:0xda10009cbd5d07dd0cecc66161fc93d7c9000da1": "dai",
  // WETH
  "1:0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": "weth",
  "8453:0x4200000000000000000000000000000000000006": "weth",
  "10:0x4200000000000000000000000000000000000006": "weth",
  "42161:0x82af49447d8a07e3bd95bd0d56f35241523fbab1": "weth",
  // WBTC
  "1:0x2260fac5e5542a773aa44fbcfedf7c193bc2c599": "wrapped-bitcoin",
  // 1INCH (kept as a known token even though Alchemy may not price it)
  "1:0x111111111117dc0aa78b770fa6a738034120c302": "1inch",
};

export function registryAssetId(
  chainId: number,
  address: string,
): string | undefined {
  return REGISTRY[`${chainId}:${address.toLowerCase()}`];
}

export function normalizeAsset(params: {
  chainId: number;
  address: string | null; // null = native
  symbol: string;
  decimals: number;
  nativeAssetId?: string;
}): string {
  const { chainId, address, symbol, decimals, nativeAssetId } = params;
  if (address === null) return nativeAssetId ?? `native:${chainId}`;

  const known = registryAssetId(chainId, address);
  if (known) return known;

  const sym = symbol.trim();
  if (sym) return `sym:${sym.toUpperCase()}@${decimals}`;

  return `${chainId}:${address.toLowerCase()}`;
}
