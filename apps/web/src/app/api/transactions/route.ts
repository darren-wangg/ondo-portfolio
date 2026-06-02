import { NextResponse } from "next/server";
import { slugsForChainIds } from "@/server/lib/chains";
import { getProvider } from "@/server/providers";
import { transactionsQuerySchema } from "@/server/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsed = transactionsQuerySchema.safeParse({
    address: searchParams.get("address"),
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 },
    );
  }

  try {
    const items = await getProvider().getTransactions(
      parsed.data.address,
      slugsForChainIds(),
    );
    return NextResponse.json({ items });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upstream failure" },
      { status: 502 },
    );
  }
}
