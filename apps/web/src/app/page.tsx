"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useMemo, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { WalletBar } from "@/components/WalletBar";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PartialFailureBanner,
} from "@/components/states";
import { type GroupBy, groupPositions } from "@/features/portfolio/grouping";
import { PortfolioTable } from "@/features/portfolio/PortfolioTable";
import { usePortfolio } from "@/hooks/usePortfolio";
import { formatUsd } from "@/lib/format";

const GROUPINGS: GroupBy[] = ["token", "network", "wallet"];

export default function Home() {
  const { data, isLoading, isError, error, walletCount } = usePortfolio();
  const [groupBy, setGroupBy] = useState<GroupBy>("token");
  const [search, setSearch] = useState("");

  const positions = data?.positions ?? [];
  const total = positions.reduce((s, p) => s + (p.valueUsd ?? 0), 0);

  const rows = useMemo(() => {
    const grouped = groupPositions(positions, groupBy);
    const q = search.trim().toLowerCase();
    if (!q) return grouped;
    return grouped.filter(
      (r) =>
        r.primary.toLowerCase().includes(q) ||
        r.positions.some(
          (p) =>
            p.symbol.toLowerCase().includes(q) ||
            p.networkName.toLowerCase().includes(q) ||
            p.walletLabel.toLowerCase().includes(q),
        ),
    );
  }, [positions, groupBy, search]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Portfolio Explorer</h1>
        </div>
        <div className="flex items-center gap-2">
          {data && (
            <span className="rounded-full border border-[var(--border)] bg-[var(--panel)] px-3 py-1 text-xs uppercase tracking-wide text-[var(--muted)]">
              {data.mode === "live" ? "● live" : "● mock"}
            </span>
          )}
          <ThemeToggle />
          <ConnectButton showBalance={false} accountStatus="address" />
        </div>
      </header>

      <div className="space-y-4">
        <WalletBar />

        {walletCount === 0 ? (
          <EmptyState />
        ) : isLoading ? (
          <LoadingState />
        ) : isError ? (
          <ErrorState message={(error as Error)?.message ?? "Unknown error"} />
        ) : (
          <>
            {data && <PartialFailureBanner sources={data.sources} />}

            <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-3">
              <span className="text-sm text-[var(--muted)]">Total value</span>
              <span className="text-xl font-semibold">{formatUsd(total)}</span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--panel)] p-1">
                {GROUPINGS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGroupBy(g)}
                    className={`rounded-md px-3 py-1.5 text-sm capitalize transition-colors ${
                      groupBy === g
                        ? "bg-[var(--accent)] text-white"
                        : "text-[var(--muted)] hover:text-[var(--fg)]"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="w-56 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
              />
            </div>

            {rows.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--panel)] p-8 text-center text-sm text-[var(--muted)]">
                No holdings match “{search}”.
              </div>
            ) : (
              <PortfolioTable rows={rows} groupBy={groupBy} />
            )}
          </>
        )}
      </div>
    </main>
  );
}
