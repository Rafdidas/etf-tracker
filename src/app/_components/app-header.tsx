"use client";
import Link from "next/link";
import { useAuth } from "../_providers/auth-provider";

export default function AppHeader() {
  const { user, loading, signOutNow } = useAuth();
  return (
    <header className="sticky top-0 z-10 border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50">
      <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold">
          ETF Tracker
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <a href="/etfs">ETFs</a>
          <a href="/accounts">Accounts</a>
          <a href="/alerts">Alerts</a>
          {!loading && user ? (
            <button onClick={signOutNow} className="rounded border px-3 py-1">
              로그아웃
            </button>
          ) : (
            <a href="/auth/login" className="rounded border px-3 py-1">
              로그인
            </a>
          )}
        </nav>
      </div>
    </header>
  );
}
