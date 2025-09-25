import { NextRequest, NextResponse } from "next/server";
export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol") || "VOO";
  // TODO: 실제 시세 API
  return NextResponse.json({ symbol, price: 500.12, currency: "USD", updatedAt: new Date().toISOString() });
}
