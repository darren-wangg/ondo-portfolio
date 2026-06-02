import type { PortfolioResponse } from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? ""; // same-origin Route Handlers

export async function fetchPortfolio(
  wallets: { address: string; label: string }[],
): Promise<PortfolioResponse> {
  const res = await fetch(`${BASE}/api/portfolio`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ wallets }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  return res.json();
}
