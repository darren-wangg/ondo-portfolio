import { describe, expect, it } from "vitest";
import { normalizeAsset } from "./lib/tokens";

describe("normalizeAsset", () => {
  it("collapses USDC across chains to one asset id", () => {
    const eth = normalizeAsset({
      chainId: 1,
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      symbol: "USDC",
      decimals: 6,
    });
    const base = normalizeAsset({
      chainId: 8453,
      address: "0x833589fCD6eDb6E08f4c7C32D4f71b1566dA3DFF",
      symbol: "USDC",
      decimals: 6,
    });
    expect(eth).toBe("usd-coin");
    expect(base).toBe("usd-coin");
  });

  it("groups native ETH across L2s but separates POL", () => {
    const ethMainnet = normalizeAsset({ chainId: 1, address: null, symbol: "ETH", decimals: 18, nativeAssetId: "native:eth" });
    const ethBase = normalizeAsset({ chainId: 8453, address: null, symbol: "ETH", decimals: 18, nativeAssetId: "native:eth" });
    const pol = normalizeAsset({ chainId: 137, address: null, symbol: "POL", decimals: 18, nativeAssetId: "native:pol" });
    expect(ethMainnet).toBe("native:eth");
    expect(ethBase).toBe("native:eth");
    expect(pol).not.toBe(ethMainnet);
  });

  it("does not merge unknown same-symbol tokens with different decimals", () => {
    const a = normalizeAsset({ chainId: 1, address: "0xaaa0000000000000000000000000000000000001", symbol: "FOO", decimals: 18 });
    const b = normalizeAsset({ chainId: 1, address: "0xbbb0000000000000000000000000000000000002", symbol: "FOO", decimals: 6 });
    expect(a).not.toBe(b);
  });
});
