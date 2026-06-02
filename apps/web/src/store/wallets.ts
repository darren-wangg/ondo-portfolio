import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WalletSource = "connected" | "watch";
export type TrackedWallet = {
  address: string;
  label: string;
  source: WalletSource;
};

type WalletStore = {
  wallets: TrackedWallet[];
  addWallet: (w: TrackedWallet) => void;
  removeWallet: (address: string) => void;
};

// Zustand is the reactive global store; the persist middleware mirrors it to
// localStorage so tracked wallets survive reloads.
export const useWalletStore = create<WalletStore>()(
  persist(
    (set, get) => ({
      wallets: [],
      addWallet: (w) => {
        const exists = get().wallets.some(
          (x) => x.address.toLowerCase() === w.address.toLowerCase(),
        );
        if (exists) return;
        set({ wallets: [...get().wallets, w] });
      },
      removeWallet: (address) =>
        set({
          wallets: get().wallets.filter(
            (x) => x.address.toLowerCase() !== address.toLowerCase(),
          ),
        }),
    }),
    { name: "ondo.wallets" },
  ),
);
