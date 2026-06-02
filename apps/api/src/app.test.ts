import request from "supertest";
import { describe, expect, it, vi } from "vitest";

// Mock the database so the health route is deterministic without a live Postgres.
vi.mock("@ondo/db", () => ({
  prisma: { $queryRaw: vi.fn().mockResolvedValue([{ result: 1 }]) },
}));

import { app } from "./app";

describe("GET /api/health", () => {
  it("returns ok when the database responds", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok", db: "connected" });
  });
});
