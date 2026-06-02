import { CHAIN_BY_SLUG } from "../lib/chains";
import { computeValueUsd, shortAddress } from "../lib/amount";
import { normalizeAsset, registryAssetId } from "../lib/tokens";
import type { Position, TxItem, WalletInput } from "../types";
import type { PortfolioProvider } from "./types";

// Shapes returned by Alchemy's Portfolio "tokens/by-address" endpoint
// (verified live against the real API).
type AlchemyToken = {
  address: string;
  network: string;
  tokenAddress: string | null; // null = native coin
  tokenBalance: string | null; // hex string
  tokenMetadata: {
    symbol: string | null;
    decimals: number | null;
    name: string | null;
    logo: string | null;
  };
  tokenPrices: { currency: string; value: string; lastUpdatedAt: string }[];
};

const DATA_BASE = "https://api.g.alchemy.com/data/v1";

export class AlchemyProvider implements PortfolioProvider {
  readonly mode = "live" as const;

  constructor(private readonly apiKey: string) {}

  async getWalletPositions(
    wallet: WalletInput,
    slugs: string[],
  ): Promise<Position[]> {
    const res = await fetch(
      `${DATA_BASE}/${this.apiKey}/assets/tokens/by-address`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addresses: [{ address: wallet.address, networks: slugs }],
          withMetadata: true,
          withPrices: true,
          includeNativeTokens: true,
        }),
      },
    );

    if (!res.ok) {
      throw new Error(`Alchemy ${res.status}: ${await res.text()}`);
    }

    const body = (await res.json()) as { data?: { tokens?: AlchemyToken[] } };
    const tokens = body.data?.tokens ?? [];
    const label = wallet.label?.trim() || shortAddress(wallet.address);

    const positions: Position[] = [];
    for (const t of tokens) {
      const chain = CHAIN_BY_SLUG.get(t.network);
      if (!chain) continue;

      const raw = BigInt(t.tokenBalance ?? "0x0");
      if (raw === 0n) continue; // drop dust / empty balances

      const isNative = t.tokenAddress === null;
      const symbol = isNative
        ? chain.nativeSymbol
        : (t.tokenMetadata.symbol ?? "").trim();
      const decimals = isNative
        ? chain.nativeDecimals
        : t.tokenMetadata.decimals;

      // Skip spam / un-parseable ERC-20s with no symbol or decimals.
      if (!isNative && (decimals == null || !symbol)) continue;

      const priceUsd = t.tokenPrices?.[0]?.value
        ? Number(t.tokenPrices[0].value)
        : null;

      // Spam filter: keep native coins, anything Alchemy can price, and known
      // registry tokens. Drops the long tail of unpriced airdrop/spam ERC-20s.
      const known =
        !isNative && registryAssetId(chain.chainId, t.tokenAddress!);
      if (!isNative && priceUsd === null && !known) continue;

      const name = isNative
        ? chain.nativeName
        : (t.tokenMetadata.name ?? symbol);
      const rawBalance = raw.toString();
      const dec = decimals ?? 18;

      positions.push({
        walletAddress: wallet.address,
        walletLabel: label,
        chainId: chain.chainId,
        networkName: chain.name,
        tokenAddress: t.tokenAddress,
        assetId: normalizeAsset({
          chainId: chain.chainId,
          address: t.tokenAddress,
          symbol,
          decimals: dec,
          nativeAssetId: chain.nativeAssetId,
        }),
        symbol,
        name,
        decimals: dec,
        logoUrl: t.tokenMetadata.logo ?? null,
        rawBalance,
        priceUsd,
        valueUsd: computeValueUsd(rawBalance, dec, priceUsd),
      });
    }

    return positions;
  }

  async getTransactions(address: string, slugs: string[]): Promise<TxItem[]> {
    const perNetwork = await Promise.allSettled(
      slugs.map((slug) => this.transfersForNetwork(address, slug)),
    );
    const items = perNetwork.flatMap((r) =>
      r.status === "fulfilled" ? r.value : [],
    );
    return items.sort((a, b) =>
      (b.timestamp ?? "").localeCompare(a.timestamp ?? ""),
    );
  }

  private async transfersForNetwork(
    address: string,
    slug: string,
  ): Promise<TxItem[]> {
    const chain = CHAIN_BY_SLUG.get(slug);
    if (!chain) return [];

    const rpc = `https://${slug}.g.alchemy.com/v2/${this.apiKey}`;
    const baseParams = {
      fromBlock: "0x0",
      toBlock: "latest",
      category: ["external", "erc20"],
      order: "desc",
      withMetadata: true,
      excludeZeroValue: true,
      maxCount: "0x14", // 20
    };

    const call = (direction: "from" | "to") =>
      fetch(rpc, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: 1,
          jsonrpc: "2.0",
          method: "alchemy_getAssetTransfers",
          params: [
            direction === "from"
              ? { ...baseParams, fromAddress: address }
              : { ...baseParams, toAddress: address },
          ],
        }),
      }).then((r) => r.json() as Promise<AssetTransfersResponse>);

    const [outgoing, incoming] = await Promise.all([call("from"), call("to")]);
    const transfers = [
      ...(outgoing.result?.transfers ?? []),
      ...(incoming.result?.transfers ?? []),
    ];

    const lower = address.toLowerCase();
    const seen = new Set<string>();
    const items: TxItem[] = [];
    for (const t of transfers) {
      if (seen.has(t.uniqueId)) continue;
      seen.add(t.uniqueId);

      const from = t.from?.toLowerCase();
      const to = t.to?.toLowerCase();
      const direction =
        from === lower && to === lower ? "self" : from === lower ? "out" : "in";

      items.push({
        hash: t.hash,
        chainId: chain.chainId,
        networkName: chain.name,
        direction,
        counterparty: direction === "out" ? (t.to ?? null) : (t.from ?? null),
        asset: t.asset ?? null,
        value: t.value ?? null,
        category: t.category,
        timestamp: t.metadata?.blockTimestamp ?? null,
      });
    }
    return items;
  }
}

type AssetTransfersResponse = {
  result?: {
    transfers: {
      uniqueId: string;
      hash: string;
      from: string | null;
      to: string | null;
      value: number | null;
      asset: string | null;
      category: string;
      metadata?: { blockTimestamp: string | null };
    }[];
  };
};
