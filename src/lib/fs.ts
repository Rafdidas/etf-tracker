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
  const q = query(collection(db, "holdings", uid, /* subcollection */ ""), where("symbol", "!=", null));
  // Firestore는 빈 서브콜렉션 경로를 못 받으므로 아래처럼 명시:
  const col = collection(db, "holdings", uid, "items");
  const snap = await getDocs(col);
  return snap.docs.map(d => ({ holdingId: d.id, ...(d.data() as Omit<HoldingDoc,"holdingId">) })) as HoldingDoc[];
}

export async function upsertHolding(uid: string, h: Omit<HoldingDoc,"holdingId"|"createdAt"|"updatedAt"> & { holdingId?: string }) {
  const id = h.holdingId ?? crypto.randomUUID();
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

export async function upsertAccountsYear(uid: string, y: number, data: Omit<AccountsYearDoc,"year"|"createdAt"|"updatedAt">) {
  const ref = doc(db, "accounts", uid, String(y));
  await setDoc(ref, { year: y, ...data, updatedAt: serverTimestamp(), createdAt: serverTimestamp() }, { merge: true });
}

/** alerts/{uid}/{alertId} */
export type AlertDoc = { alertId: string; symbol: string; rule: "price_above"|"price_below"|"drawdown"; threshold: number; enabled: boolean; createdAt?: any; updatedAt?: any; };

export async function upsertAlert(uid: string, a: Omit<AlertDoc,"alertId"|"createdAt"|"updatedAt"> & { alertId?: string }) {
  const id = a.alertId ?? crypto.randomUUID();
  const ref = doc(db, "alerts", uid, "items", id);
  await setDoc(ref, { ...a, updatedAt: serverTimestamp(), createdAt: serverTimestamp() }, { merge: true });
  return id;
}
