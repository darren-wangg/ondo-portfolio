import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { arbitrum, base, mainnet, optimism, polygon } from "wagmi/chains";

// projectId enables WalletConnect; without it only injected wallets (MetaMask)
// are offered, which is fine for the read-only address-collection flow.
export const wagmiConfig = getDefaultConfig({
  appName: "Ondo Portfolio Explorer",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "ondo-demo",
  chains: [mainnet, base, arbitrum, optimism, polygon],
  ssr: true,
});
