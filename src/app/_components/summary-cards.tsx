"use client";
import { useAuth } from "../_providers/auth-provider";
import { useQuery } from "@tanstack/react-query";
import { listHoldings } from "@/lib/fs";
import { useFx } from "@/hooks/useFx";
import { useQuote } from "@/hooks/useQuote";

export default function SummaryCards() {
  const { user, loading } = useAuth();
  const { data: holdings = [] } = useQuery({
    queryKey: ["holdings", user?.uid],
    queryFn: () => listHoldings(user!.uid),
    enabled: !!user && !loading,
  });
  const { data: fx } = useFx();

  // 심볼 하나만 샘플로 시세 불러오기 (MVP)
  const first = holdings[0]?.symbol ?? "VOO";
  const { data: q } = useQuote(first);

  // 매우 러프한 계산 (MVP)
  const invested = holdings.reduce(
    (sum, h) =>
      sum + h.avgPrice * h.quantity * (h.currency === "USD" ? fx?.KRW ?? 1400 : 1),
    0
  );
  const evaluated = holdings.reduce((sum, h) => {
    const price = h.symbol === first ? q?.price ?? 0 : 0; // TODO: 멀티 시세
    const krwRate = h.currency === "USD" ? fx?.KRW ?? 1400 : 1;
    return sum + price * h.quantity * krwRate;
  }, 0);
  const roi = invested ? ((evaluated - invested) / invested) * 100 : 0;

  return (
    <section className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-xl border p-4">
        <div className="text-sm text-neutral-500">전체 투자금</div>
        <div className="mt-2 text-2xl font-bold">
          {Math.round(invested).toLocaleString()}원
        </div>
      </div>
      <div className="rounded-xl border p-4">
        <div className="text-sm text-neutral-500">현재 평가액</div>
        <div className="mt-2 text-2xl font-bold">
          {Math.round(evaluated).toLocaleString()}원
        </div>
      </div>
      <div className="rounded-xl border p-4">
        <div className="text-sm text-neutral-500">총 수익률</div>
        <div className="mt-2 text-2xl font-bold">{roi.toFixed(2)}%</div>
      </div>
    </section>
  );
}
