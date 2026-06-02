"use client";

import { motion } from "framer-motion";
import { formatPrice, formatTokenAmount, formatUsd } from "@/lib/format";
import type { GroupBy, GroupRow } from "./grouping";

function Avatar({ row }: { row: GroupRow }) {
  const initials = (row.symbol ?? row.primary).slice(0, 3).toUpperCase();
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--panel-2)] text-xs font-semibold text-[var(--muted)]">
      {initials}
    </div>
  );
}

export function PortfolioTable({
  rows,
  groupBy,
}: {
  rows: GroupRow[];
  groupBy: GroupBy;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--panel)]">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--muted)]">
            <th className="px-4 py-3 font-medium">
              {groupBy === "token"
                ? "Asset"
                : groupBy === "network"
                  ? "Network"
                  : "Wallet"}
            </th>
            <th className="px-4 py-3 text-right font-medium">Balance</th>
            <th className="px-4 py-3 text-right font-medium">Price</th>
            <th className="px-4 py-3 text-right font-medium">Value</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <motion.tr
              key={row.key}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, delay: Math.min(i * 0.015, 0.2) }}
              className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--panel-2)]"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar row={row} />
                  <div>
                    <div className="font-medium">{row.primary}</div>
                    <div className="text-xs text-[var(--muted)]">
                      {row.secondary}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-right font-mono">
                {row.rawBalance !== null
                  ? `${formatTokenAmount(row.rawBalance, row.decimals)}${row.symbol ? ` ${row.symbol}` : ""}`
                  : "—"}
              </td>
              <td className="px-4 py-3 text-right font-mono text-[var(--muted)]">
                {groupBy === "token" ? formatPrice(row.priceUsd) : "—"}
              </td>
              <td className="px-4 py-3 text-right font-mono font-medium">
                {formatUsd(row.valueUsd)}
                {row.hasUnpriced && (
                  <span
                    title="Some holdings have no price"
                    className="text-[var(--muted)]"
                  >
                    {" "}
                    *
                  </span>
                )}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
