"use client";

import "@rainbow-me/rainbowkit/styles.css";
import {
  RainbowKitProvider,
  darkTheme,
  lightTheme,
} from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, useTheme } from "next-themes";
import { type ReactNode, useEffect, useState } from "react";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "@/lib/wagmi";

function RainbowKitThemed({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Until mounted, resolvedTheme is unknown on the server and the first client
  // render — pin to darkTheme() on both so RainbowKit's injected <style> matches
  // and hydration doesn't mismatch. Switch to the real theme after mount.
  const theme =
    mounted && resolvedTheme === "light" ? lightTheme() : darkTheme();

  return (
    <RainbowKitProvider modalSize="compact" theme={theme}>
      {children}
    </RainbowKitProvider>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: 1 },
        },
      }),
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitThemed>{children}</RainbowKitThemed>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}
