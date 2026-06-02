export function toAmountNumber(raw: bigint, decimals: number): number {
  if (decimals <= 0) return Number(raw);
  const neg = raw < 0n;
  const s = (neg ? -raw : raw).toString().padStart(decimals + 1, "0");
  const i = s.slice(0, s.length - decimals);
  const f = s.slice(s.length - decimals).slice(0, 8);
  const n = Number(`${i}.${f || "0"}`);
  return neg ? -n : n;
}

export function formatTokenAmount(
  raw: bigint | null,
  decimals: number | null,
): string {
  if (raw === null || decimals === null) return "—";
  const n = toAmountNumber(raw, decimals);
  return n.toLocaleString("en-US", { maximumFractionDigits: n >= 1 ? 4 : 6 });
}

export function formatUsd(n: number | null): string {
  if (n == null) return "—";
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}

export function formatPrice(n: number | null): string {
  if (n == null) return "—";
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n < 1 ? 6 : 2,
  });
}

export function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
