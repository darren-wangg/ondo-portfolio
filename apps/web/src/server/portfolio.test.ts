import { describe, expect, it } from "vitest";
import { ALL_SLUGS } from "./lib/chains";
import { buildPortfolio } from "./services/portfolio";

// No ALCHEMY_API_KEY in the test env → mock provider backs these.
const GOOD = "0x" + "1".repeat(40);
const BAD = "0xfail" + "0".repeat(36);

describe("buildPortfolio (mock provider)", () => {
  it("returns normalized positions and ok status for a good wallet", async () => {
    const res = await buildPortfolio([{ address: GOOD, label: "Main" }], ALL_SLUGS);
    expect(res.mode).toBe("mock");
    expect(res.positions.length).toBeGreaterThan(0);
    expect(res.sources[0]).toMatchObject({ status: "ok" });

    // USDC mock holdings on 3 chains share one assetId.
    const usdc = res.positions.filter((p) => p.symbol === "USDC");
    expect(usdc.length).toBe(3);
    expect(new Set(usdc.map((p) => p.assetId)).size).toBe(1);
  });

  it("records a failed wallet without dropping successful ones", async () => {
    const res = await buildPortfolio(
      [
        { address: GOOD, label: "Good" },
        { address: BAD, label: "Bad" },
      ],
      ALL_SLUGS,
    );
    const statuses = res.sources.map((s) => s.status);
    expect(statuses).toContain("ok");
    expect(statuses).toContain("failed");
    expect(res.positions.length).toBeGreaterThan(0);
  });
});
