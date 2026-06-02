import { NextResponse } from "next/server";
import { getProvider } from "@/server/providers";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json({ status: "ok", mode: getProvider().mode });
}
