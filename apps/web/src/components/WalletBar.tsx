"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { shortAddress } from "@/lib/format";
import { useWalletStore } from "@/store/wallets";

const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;

export function WalletBar() {
  const { address, isConnected } = useAccount();
  const wallets = useWalletStore((s) => s.wallets);
  const addWallet = useWalletStore((s) => s.addWallet);
  const removeWallet = useWalletStore((s) => s.removeWallet);

  const [watch, setWatch] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Each connection event captures the active address into the tracked list.
  useEffect(() => {
    if (isConnected && address) {
      addWallet({ address, label: shortAddress(address), source: "connected" });
    }
  }, [address, isConnected, addWallet]);

  const addWatch = () => {
    const a = watch.trim();
    if (!ADDRESS_RE.test(a)) {
      setError("Enter a valid 0x address");
      return;
    }
    addWallet({ address: a, label: shortAddress(a), source: "watch" });
    setWatch("");
    setError(null);
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ConnectButton showBalance={false} accountStatus="address" />
          <span className="text-sm text-[var(--muted)]">connects a wallet</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={watch}
            onChange={(e) => setWatch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addWatch()}
            placeholder="Watch any 0x address…"
            spellCheck={false}
            className="w-72 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 font-mono text-sm outline-none focus:border-[var(--accent)]"
          />
          <button
            type="button"
            onClick={addWatch}
            className="rounded-lg bg-[var(--accent)] px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Track
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-[var(--bad)]">{error}</p>}

      {wallets.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {wallets.map((w) => (
            <span
              key={w.address}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--panel-2)] px-3 py-1 text-sm"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{
                  background:
                    w.source === "connected" ? "var(--good)" : "var(--accent)",
                }}
                title={w.source}
              />
              <span className="font-mono">{w.label}</span>
              <button
                type="button"
                aria-label="Remove wallet"
                onClick={() => removeWallet(w.address)}
                className="text-[var(--muted)] hover:text-[var(--bad)]"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
