"use client";
import { useAuth } from "../_providers/auth-provider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listHoldings,
  upsertHolding,
  deleteHolding,
  HoldingDoc,
  upsertAccountsYear,
} from "@/lib/fs";
import { useState } from "react";

export default function AccountsPage() {
  const { user, loading } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    symbol: "",
    avgPrice: "",
    quantity: "",
    currency: "USD" as "USD" | "KRW",
  });

  const { data: holdings = [], isLoading } = useQuery({
    queryKey: ["holdings", user?.uid],
    queryFn: () => listHoldings(user!.uid),
    enabled: !!user && !loading,
  });

  const mUpsert = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("로그인 필요");
      const symbol = form.symbol.trim().toUpperCase();
      const avgPrice = Number(form.avgPrice);
      const quantity = Number(form.quantity);
      if (!symbol) throw new Error("심볼을 입력하세요.");
      if (!Number.isFinite(avgPrice) || avgPrice < 0)
        throw new Error("평단이 올바르지 않습니다.");
      if (!Number.isFinite(quantity) || quantity <= 0)
        throw new Error("수량이 올바르지 않습니다.");

      return upsertHolding(user.uid, {
        symbol,
        avgPrice,
        quantity,
        currency: form.currency,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["holdings", user?.uid] });
      setForm({ symbol: "", avgPrice: "", quantity: "", currency: "USD" });
    },
    onError: (e: any) => {
      console.error("mUpsert error:", e?.code, e?.message, e);
      alert(e?.message ?? "보유 추가 중 오류");
    },
  });

  const mDelete = useMutation({
    mutationFn: async (holdingId: string) => {
      if (!user) throw new Error("로그인 필요");
      await deleteHolding(user.uid, holdingId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["holdings", user?.uid] }),
  });

  const saveAccounts = async () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }
    try {
      const year = new Date().getFullYear();

      // 🔐 숫자 가드 (혹시라도 NaN 방지)
      const payload = { deposits: 0, withdrawals: 0, cashKRW: 0, cashUSD: 0 };
      for (const [k, v] of Object.entries(payload)) {
        if (!Number.isFinite(v as number) || (v as number) < 0) {
          throw new Error(`잘못된 숫자 입력: ${k}=${v}`);
        }
      }

      await upsertAccountsYear(user.uid, year, payload);
      alert("올해 계좌 문서 생성/업데이트 완료");
    } catch (e: any) {
      console.error("upsertAccountsYear error:", e?.code, e?.message, e);
      alert(`${e?.code ?? "error"}: ${e?.message ?? "계좌 저장 중 오류"}`);
    }
  };

  if (loading) return <main className="p-6">로딩...</main>;

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold mb-2">계좌 관리</h1>

      {/* Holding 입력 */}
      <section className="rounded-xl border p-4 space-y-3">
        <div className="font-medium">보유 종목 추가</div>
        <div className="grid sm:grid-cols-4 gap-2">
          <input
            value={form.symbol}
            onChange={(e) => setForm((s) => ({ ...s, symbol: e.target.value }))}
            placeholder="심볼 (VOO)"
            className="rounded border px-3 py-2"
          />
          <input
            value={form.quantity}
            onChange={(e) => setForm((s) => ({ ...s, quantity: e.target.value }))}
            placeholder="수량"
            className="rounded border px-3 py-2"
            inputMode="decimal"
          />
          <input
            value={form.avgPrice}
            onChange={(e) => setForm((s) => ({ ...s, avgPrice: e.target.value }))}
            placeholder="평단"
            className="rounded border px-3 py-2"
            inputMode="decimal"
          />
          <select
            value={form.currency}
            onChange={(e) =>
              setForm((s) => ({ ...s, currency: e.target.value as "USD" | "KRW" }))
            }
            className="rounded border px-3 py-2"
          >
            <option value="USD">USD</option>
            <option value="KRW">KRW</option>
          </select>
        </div>
        <button
          onClick={() => mUpsert.mutate()}
          disabled={mUpsert.isPending}
          className="rounded border px-4 py-2"
        >
          {mUpsert.isPending ? "저장 중..." : "추가"}
        </button>
      </section>

      {/* 목록 */}
      <section className="rounded-xl border p-4">
        <div className="font-medium mb-2">보유 목록</div>
        {isLoading ? (
          "로딩..."
        ) : (
          <ul className="divide-y">
            {holdings.map((h: HoldingDoc) => (
              <li key={h.holdingId} className="py-2 flex items-center justify-between">
                <span className="text-sm">
                  {h.symbol} · {h.quantity} · {h.avgPrice} ({h.currency})
                </span>
                <button
                  onClick={() => mDelete.mutate(h.holdingId)}
                  className="text-red-600 text-sm"
                >
                  삭제
                </button>
              </li>
            ))}
            {holdings.length === 0 && (
              <li className="py-4 text-sm text-neutral-500">아직 없음</li>
            )}
          </ul>
        )}
      </section>

      <button onClick={saveAccounts} className="rounded border px-4 py-2">
        올해 계좌 문서 생성
      </button>
    </main>
  );
}
