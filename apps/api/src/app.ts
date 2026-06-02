import cors from "cors";
import express from "express";
import { prisma } from "@ondo/db";

export const app = express();

app.use(cors());
app.use(express.json());

// Liveness + DB connectivity check.
app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", db: "connected" });
  } catch {
    res.status(503).json({ status: "degraded", db: "unreachable" });
  }
});

export default app;
