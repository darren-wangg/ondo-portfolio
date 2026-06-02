import type { Position, TxItem, WalletInput } from "../types";

/** A swappable data source. Implement this to back the portfolio with a
 *  different API (Zerion, GoldRush, …) — selection happens in ./index.ts. */
export interface PortfolioProvider {
  readonly mode: "live" | "mock";

  /** All normalized holdings for one wallet across the given Alchemy network
   *  slugs. Throws on transport failure so the service can record it per-wallet. */
  getWalletPositions(wallet: WalletInput, slugs: string[]): Promise<Position[]>;

  /** Recent transactions across the given networks (stretch feature). */
  getTransactions(address: string, slugs: string[]): Promise<TxItem[]>;
}
