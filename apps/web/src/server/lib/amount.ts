// Convert integer base units (BigInt) to a JS number for USD math / display.
// We avoid Number(rawBalance) directly because raw balances routinely exceed
// Number.MAX_SAFE_INTEGER. Split on the decimal point as strings, then parse.

const MAX_FRAC_DIGITS = 8;

export function rawToAmount(raw: bigint, decimals: number): number {
  if (decimals <= 0) return Number(raw);

  const negative = raw < 0n;
  const digits = (negative ? -raw : raw).toString().padStart(decimals + 1, "0");
  const intPart = digits.slice(0, digits.length - decimals);
  const fracPart = digits
    .slice(digits.length - decimals, digits.length)
    .slice(0, MAX_FRAC_DIGITS);
  const value = Number(`${intPart}.${fracPart || "0"}`);
  return negative ? -value : value;
}

export function computeValueUsd(
  rawBalance: string,
  decimals: number,
  priceUsd: number | null,
): number | null {
  if (priceUsd == null) return null;
  return rawToAmount(BigInt(rawBalance), decimals) * priceUsd;
}

/** Short, readable wallet label like 0x1234…abcd. */
export function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
