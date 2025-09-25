import { db } from "./firebase";
import { collection, doc, getDocs, query, setDoc, where, serverTimestamp, deleteDoc } from "firebase/firestore";

export type HoldingDoc = {
  holdingId: string;
  symbol: string;
  avgPrice: number;
  quantity: number;
  currency: "USD" | "KRW";
  accountId?: string;
  createdAt?: any; updatedAt?: any;
};

export async function listHoldings(uid: string) {
  const col = collection(db, "holdings", uid, "items"); // ✅ 유효 경로만 사용
  const snap = await getDocs(col);
  return snap.docs.map(d => ({ holdingId: d.id, ...(d.data() as Omit<HoldingDoc,"holdingId">) })) as HoldingDoc[];
}

export async function upsertHolding(uid: string, h: Omit<HoldingDoc,"holdingId"|"createdAt"|"updatedAt"> & { holdingId?: string }) {
  const id = h.holdingId ?? `${h.symbol}_${h.currency}`; // ← 심볼+통화로 키 고정
  const ref = doc(db, "holdings", uid, "items", id);
  await setDoc(ref, { ...h, updatedAt: serverTimestamp(), createdAt: serverTimestamp() }, { merge: true });
  return id;
}

export async function deleteHolding(uid: string, holdingId: string) {
  const ref = doc(db, "holdings", uid, "items", holdingId);
  await deleteDoc(ref);
}

/** accounts/{uid}/{year} */
export type AccountsYearDoc = { year: number; deposits: number; withdrawals: number; cashKRW: number; cashUSD: number; createdAt?: any; updatedAt?: any; };

export async function upsertAccountsYear(
  uid: string,
  y: number,
  data: Omit<AccountsYearDoc, "year" | "createdAt" | "updatedAt">
) {
  const ref = doc(db, "accounts", uid, "years", String(y));

  // 🔎 디버그 로그
  console.log("[upsertAccountsYear] uid:", uid);
  console.log("[upsertAccountsYear] year:", y);
  console.log("[upsertAccountsYear] ref.path:", ref.path);
  console.log("[upsertAccountsYear] projectId:", (db as any)?.app?.options?.projectId);

  await setDoc(
    ref,
    { year: y, ...data, updatedAt: serverTimestamp(), createdAt: serverTimestamp() },
    { merge: true }
  );
}

/** alerts/{uid}/{alertId} */
export type AlertDoc = { alertId: string; symbol: string; rule: "price_above"|"price_below"|"drawdown"; threshold: number; enabled: boolean; createdAt?: any; updatedAt?: any; };

export async function upsertAlert(uid: string, a: Omit<AlertDoc,"alertId"|"createdAt"|"updatedAt"> & { alertId?: string }) {
  const id = a.alertId ?? crypto.randomUUID();
  const ref = doc(db, "alerts", uid, "items", id);
  await setDoc(ref, { ...a, updatedAt: serverTimestamp(), createdAt: serverTimestamp() }, { merge: true });
  return id;
}
