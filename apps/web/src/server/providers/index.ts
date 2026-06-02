import { AlchemyProvider } from "./alchemy";
import { MockProvider } from "./mock";
import type { PortfolioProvider } from "./types";

let cached: PortfolioProvider | null = null;

/** Live Alchemy provider when ALCHEMY_API_KEY is set, mock otherwise. */
export function getProvider(): PortfolioProvider {
  if (cached) return cached;

  const key = process.env.ALCHEMY_API_KEY;
  if (key) {
    cached = new AlchemyProvider(key);
  } else {
    console.warn("[portfolio] ALCHEMY_API_KEY not set — using mock provider");
    cached = new MockProvider();
  }
  return cached;
}
