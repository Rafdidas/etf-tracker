"use client";

import { useRef, useState } from "react";
import { auth, provider, db } from "@/lib/firebase";
import { signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function LoginPage() {
  const inFlight = useRef(false);
  const [loading, setLoading] = useState(false);

  // 팝업이 뜰 때 ‘계정 선택’ 강제 (선택)
  provider.setCustomParameters({ prompt: "select_account" });

  const upsertUser = async (u: any) => {
    await setDoc(
      doc(db, "users", u.uid),
      {
        uid: u.uid,
        email: u.email ?? null,
        displayName: u.displayName ?? null,
        photoURL: u.photoURL ?? null,
        provider: "google",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  };

  const login = async () => {
    if (inFlight.current) return; // 중복 실행 가드
    inFlight.current = true;
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, provider);
      await upsertUser(res.user);
      // TODO: 로그인 후 라우팅 (예: window.location.href = "/")
    } catch (e: any) {
      // 팝업이 취소되거나 겹친 경우: 조용히 무시
      if (
        e?.code === "auth/cancelled-popup-request" ||
        e?.code === "auth/popup-closed-by-user"
      ) {
        // 필요시 여기서 토스트 정도만
        // toast.info("로그인 팝업이 취소되었습니다.");
        return;
      }
      // 그 외 에러는 확인
      console.error(e);
      alert(e?.message ?? "로그인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
      inFlight.current = false;
    }
  };

  // 팝업이 막히는 환경일 경우 폴백 (선택)
  const loginWithRedirect = async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setLoading(true);
    try {
      await signInWithRedirect(auth, provider);
      // redirect 후 돌아오면 아래에서 결과를 수거
    } finally {
      // redirect는 페이지 이동하므로 여기 flag는 큰 의미 없음
    }
  };

  // 리다이렉트 결과 수거 (선택)
  // useEffect(() => {
  //   getRedirectResult(auth).then((res) => {
  //     if (res?.user) upsertUser(res.user);
  //   }).catch(console.error);
  // }, []);

  return (
    <main className="min-h-dvh grid place-content-center">
      <div className="flex flex-col gap-3">
        <button
          onClick={login}
          disabled={loading}
          className="rounded-lg border px-4 py-2 hover:bg-neutral-100 disabled:opacity-50"
        >
          {loading ? "로그인 중..." : "구글로 시작하기 (팝업)"}
        </button>

        {/* 팝업이 막히면 이 버튼으로 시도 */}
        <button
          onClick={loginWithRedirect}
          className="text-sm text-neutral-500 underline"
        >
          팝업이 안 뜨나요? 리다이렉트로 로그인
        </button>
      </div>
    </main>
  );
}
