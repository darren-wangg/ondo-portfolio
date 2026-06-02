"use client";

import type { SourceStatus } from "@/lib/types";
import { shortAddress } from "@/lib/format";

export function LoadingState() {
  return (
    <div className="space-y-2 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="h-12 animate-pulse rounded-lg bg-[var(--panel-2)]"
        />
      ))}
    </div>
  );
}

export function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--panel)] p-12 text-center">
      <p className="text-lg font-medium">No wallets yet</p>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Connect a wallet or track any address to build your portfolio.
      </p>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-[var(--bad)]/40 bg-[var(--panel)] p-6 text-center">
      <p className="font-medium text-[var(--bad)]">Couldn’t load portfolio</p>
      <p className="mt-1 text-sm text-[var(--muted)]">{message}</p>
    </div>
  );
}

export function PartialFailureBanner({ sources }: { sources: SourceStatus[] }) {
  const failed = sources.filter((s) => s.status === "failed");
  if (failed.length === 0) return null;
  return (
    <div className="rounded-xl border border-[var(--bad)]/40 bg-[var(--bad)]/10 p-3 text-sm">
      <span className="font-medium text-[var(--bad)]">
        {failed.length} wallet{failed.length === 1 ? "" : "s"} failed to load.
      </span>{" "}
      <span className="text-[var(--muted)]">
        Showing partial results —{" "}
        {failed
          .map((f) => f.walletLabel || shortAddress(f.walletAddress))
          .join(", ")}
        .
      </span>
    </div>
  );
}
