import type { Position } from "@/lib/types";

export type GroupBy = "token" | "network" | "wallet";

export type GroupRow = {
  key: string;
  primary: string;
  secondary: string;
  symbol: string | null;
  decimals: number | null; // null when a group mixes decimals (can't sum balance)
  rawBalance: bigint | null; // summed base units, or null if mixed
  priceUsd: number | null;
  valueUsd: number;
  hasUnpriced: boolean;
  positions: Position[];
};

const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;

/** Pure groupBy over the flat position list — switching grouping never refetches.
 *  BigInt sums happen here so balances stay precise. */
export function groupPositions(positions: Position[], by: GroupBy): GroupRow[] {
  const keyOf = (p: Position) =>
    by === "token"
      ? p.assetId
      : by === "network"
        ? String(p.chainId)
        : p.walletAddress.toLowerCase();

  const buckets = new Map<string, Position[]>();
  for (const p of positions) {
    const k = keyOf(p);
    (buckets.get(k) ?? buckets.set(k, []).get(k)!).push(p);
  }

  const rows: GroupRow[] = [];
  for (const [key, group] of buckets) {
    const valueUsd = group.reduce((s, p) => s + (p.valueUsd ?? 0), 0);
    const hasUnpriced = group.some((p) => p.valueUsd === null);
    const networks = new Set(group.map((p) => p.chainId));
    const wallets = new Set(group.map((p) => p.walletAddress.toLowerCase()));
    const assets = new Set(group.map((p) => p.assetId));

    // Sum raw balances only when every position shares the same decimals.
    const decimalsSet = new Set(group.map((p) => p.decimals));
    const sameDecimals = decimalsSet.size === 1;
    const rawBalance = sameDecimals
      ? group.reduce((s, p) => s + BigInt(p.rawBalance), 0n)
      : null;
    const decimals = sameDecimals ? group[0]!.decimals : null;

    let primary: string;
    let secondary: string;
    if (by === "token") {
      primary = group[0]!.symbol;
      secondary = `${plural(networks.size, "network")} · ${plural(wallets.size, "wallet")}`;
    } else if (by === "network") {
      primary = group[0]!.networkName;
      secondary = `${plural(assets.size, "token")} · ${plural(wallets.size, "wallet")}`;
    } else {
      primary = group[0]!.walletLabel;
      secondary = `${plural(networks.size, "network")} · ${plural(assets.size, "token")}`;
    }

    rows.push({
      key,
      primary,
      secondary,
      symbol: by === "token" ? group[0]!.symbol : null,
      decimals,
      rawBalance,
      priceUsd: by === "token" ? (group[0]!.priceUsd ?? null) : null,
      valueUsd,
      hasUnpriced,
      positions: group,
    });
  }

  return rows.sort((a, b) => b.valueUsd - a.valueUsd);
}
