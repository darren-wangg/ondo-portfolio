import { NextResponse } from "next/server";
import { slugsForChainIds } from "@/server/lib/chains";
import { buildPortfolio } from "@/server/services/portfolio";
import { portfolioBodySchema } from "@/server/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = portfolioBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 },
    );
  }

  try {
    const portfolio = await buildPortfolio(
      parsed.data.wallets,
      slugsForChainIds(parsed.data.chainIds),
    );
    return NextResponse.json(portfolio);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upstream failure" },
      { status: 502 },
    );
  }
}
