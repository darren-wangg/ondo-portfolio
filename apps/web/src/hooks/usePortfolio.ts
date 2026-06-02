"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchPortfolio } from "@/lib/api";
import { useWalletStore } from "@/store/wallets";

export function usePortfolio() {
  const wallets = useWalletStore((s) => s.wallets);

  const query = useQuery({
    queryKey: ["portfolio", wallets.map((w) => w.address.toLowerCase()).sort()],
    queryFn: () =>
      fetchPortfolio(
        wallets.map((w) => ({ address: w.address, label: w.label })),
      ),
    enabled: wallets.length > 0,
  });

  return { ...query, walletCount: wallets.length };
}
