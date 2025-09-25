import { NextResponse } from "next/server";
export async function GET() {
  // TODO: 실제 API 연동
  return NextResponse.json({ base: "USD", KRW: 1400, updatedAt: new Date().toISOString() });
}
