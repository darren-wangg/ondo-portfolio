import { CHAIN_BY_ID } from "../lib/chains";
import { computeValueUsd, shortAddress } from "../lib/amount";
import { normalizeAsset } from "../lib/tokens";
import type { Position, TxItem, WalletInput } from "../types";
import type { PortfolioProvider } from "./types";

// Used when ALCHEMY_API_KEY is absent so the app is fully runnable/demoable
// offline. Any wallet whose address contains "fail" throws, to exercise the
// partial-failure UI alongside successful wallets.

type Holding = {
  chainId: number;
  tokenAddress: string | null;
  symbol: string;
  name: string;
  decimals: number;
  amount: number; // whole-token amount; scaled to base units below
  priceUsd: number | null;
};

const TEMPLATE: Holding[] = [
  { chainId: 1, tokenAddress: null, symbol: "ETH", name: "Ether", decimals: 18, amount: 3.42, priceUsd: 1908.77 },
  { chainId: 8453, tokenAddress: null, symbol: "ETH", name: "Ether", decimals: 18, amount: 1.18, priceUsd: 1908.77 },
  // USDC on three networks — should collapse into ONE token group.
  { chainId: 1, tokenAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", symbol: "USDC", name: "USD Coin", decimals: 6, amount: 4200.5, priceUsd: 1.0 },
  { chainId: 8453, tokenAddress: "0x833589fcd6edb6e08f4c7c32d4f71b1566da3dff", symbol: "USDC", name: "USD Coin", decimals: 6, amount: 1875.0, priceUsd: 1.0 },
  { chainId: 42161, tokenAddress: "0xaf88d065e77c8cc2239327c5edb3a432268e5831", symbol: "USDC", name: "USD Coin", decimals: 6, amount: 980.25, priceUsd: 1.0 },
  { chainId: 1, tokenAddress: "0xdac17f958d2ee523a2206206994597c13d831ec7", symbol: "USDT", name: "Tether USD", decimals: 6, amount: 2500.0, priceUsd: 1.0 },
  { chainId: 1, tokenAddress: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", symbol: "WETH", name: "Wrapped Ether", decimals: 18, amount: 0.75, priceUsd: 1908.77 },
  { chainId: 137, tokenAddress: null, symbol: "POL", name: "Polygon", decimals: 18, amount: 1450.0, priceUsd: 0.22 },
  // A token with no price → value column should show "—".
  { chainId: 1, tokenAddress: "0x111111111117dc0aa78b770fa6a738034120c302", symbol: "1INCH", name: "1inch", decimals: 18, amount: 320.0, priceUsd: null },
];

/** Deterministic 0.6–1.4 multiplier so different wallets show different totals. */
function walletFactor(address: string): number {
  let h = 0;
  for (const ch of address) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return 0.6 + (h % 800) / 1000;
}

function toBaseUnits(amount: number, decimals: number): string {
  const [int, frac = ""] = amount.toString().split(".");
  const fracPadded = (frac + "0".repeat(decimals)).slice(0, decimals);
  return BigInt(`${int}${fracPadded}`).toString();
}

export class MockProvider implements PortfolioProvider {
  readonly mode = "mock" as const;

  async getWalletPositions(
    wallet: WalletInput,
    slugs: string[],
  ): Promise<Position[]> {
    if (wallet.address.toLowerCase().includes("fail")) {
      throw new Error("Mock RPC unavailable for this wallet (simulated)");
    }

    const factor = walletFactor(wallet.address);
    const label = wallet.label?.trim() || shortAddress(wallet.address);
    const allowedSlugs = new Set(slugs);

    return TEMPLATE.filter((h) => {
      const chain = CHAIN_BY_ID.get(h.chainId);
      return chain && allowedSlugs.has(chain.alchemySlug);
    }).map((h) => {
      const chain = CHAIN_BY_ID.get(h.chainId)!;
      const rawBalance = toBaseUnits(
        Number((h.amount * factor).toFixed(h.decimals > 6 ? 6 : h.decimals)),
        h.decimals,
      );
      return {
        walletAddress: wallet.address,
        walletLabel: label,
        chainId: chain.chainId,
        networkName: chain.name,
        tokenAddress: h.tokenAddress,
        assetId: normalizeAsset({
          chainId: h.chainId,
          address: h.tokenAddress,
          symbol: h.symbol,
          decimals: h.decimals,
          nativeAssetId: chain.nativeAssetId,
        }),
        symbol: h.symbol,
        name: h.name,
        decimals: h.decimals,
        logoUrl: null,
        rawBalance,
        priceUsd: h.priceUsd,
        valueUsd: computeValueUsd(rawBalance, h.decimals, h.priceUsd),
      } satisfies Position;
    });
  }

  async getTransactions(address: string): Promise<TxItem[]> {
    if (address.toLowerCase().includes("fail")) return [];
    const now = Date.now();
    const sample: Array<Omit<TxItem, "timestamp"> & { agoHours: number }> = [
      { hash: "0xabc1", chainId: 1, networkName: "Ethereum", direction: "in", counterparty: "0x1111111111111111111111111111111111111111", asset: "USDC", value: 500, category: "erc20", agoHours: 3 },
      { hash: "0xabc2", chainId: 8453, networkName: "Base", direction: "out", counterparty: "0x2222222222222222222222222222222222222222", asset: "ETH", value: 0.25, category: "external", agoHours: 27 },
      { hash: "0xabc3", chainId: 42161, networkName: "Arbitrum", direction: "in", counterparty: "0x3333333333333333333333333333333333333333", asset: "USDC", value: 980.25, category: "erc20", agoHours: 73 },
    ];
    return sample.map(({ agoHours, ...t }) => ({
      ...t,
      timestamp: new Date(now - agoHours * 3_600_000).toISOString(),
    }));
  }
}
