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
      const payload = {
        symbol: form.symbol.trim().toUpperCase(),
        avgPrice: Number(form.avgPrice),
        quantity: Number(form.quantity),
        currency: form.currency,
      };
      return upsertHolding(user.uid, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["holdings", user?.uid] });
      setForm({ symbol: "", avgPrice: "", quantity: "", currency: "USD" });
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
    if (!user) return;
    const year = new Date().getFullYear();
    await upsertAccountsYear(user.uid, year, {
      deposits: 0,
      withdrawals: 0,
      cashKRW: 0,
      cashUSD: 0,
    });
    alert("올해 계좌 문서 생성/업데이트 완료");
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
            value={form.avgPrice}
            onChange={(e) => setForm((s) => ({ ...s, avgPrice: e.target.value }))}
            placeholder="평단"
            className="rounded border px-3 py-2"
            inputMode="decimal"
          />
          <input
            value={form.quantity}
            onChange={(e) => setForm((s) => ({ ...s, quantity: e.target.value }))}
            placeholder="수량"
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
                  {h.symbol} · {h.quantity} @ {h.avgPrice} ({h.currency})
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
