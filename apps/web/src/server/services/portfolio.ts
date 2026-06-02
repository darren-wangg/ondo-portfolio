import { shortAddress } from "../lib/amount";
import { getProvider } from "../providers";
import type { PortfolioResponse, WalletInput } from "../types";

/** Fetch + normalize holdings for every wallet. Uses Promise.allSettled so one
 *  failing wallet/chain doesn't sink the whole portfolio — failures surface in
 *  `sources` for the partial-failure UI. */
export async function buildPortfolio(
  wallets: WalletInput[],
  slugs: string[],
): Promise<PortfolioResponse> {
  const provider = getProvider();

  const settled = await Promise.allSettled(
    wallets.map((w) => provider.getWalletPositions(w, slugs)),
  );

  const response: PortfolioResponse = {
    positions: [],
    sources: [],
    mode: provider.mode,
  };

  settled.forEach((result, i) => {
    const wallet = wallets[i]!;
    const label = wallet.label?.trim() || shortAddress(wallet.address);

    if (result.status === "fulfilled") {
      response.positions.push(...result.value);
      response.sources.push({
        walletAddress: wallet.address,
        walletLabel: label,
        status: "ok",
        count: result.value.length,
      });
    } else {
      response.sources.push({
        walletAddress: wallet.address,
        walletLabel: label,
        status: "failed",
        error:
          result.reason instanceof Error
            ? result.reason.message
            : String(result.reason),
      });
    }
  });

  return response;
}
