"use client";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";

type AuthCtx = { user: User | null; loading: boolean; signOutNow: () => Promise<void> };
const Ctx = createContext<AuthCtx>({
  user: null,
  loading: true,
  signOutNow: async () => {},
});
export const useAuth = () => useContext(Ctx);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      // 보호 페이지: 로그인 없으면 /auth/login 으로
      const protectedPaths = ["/", "/etfs", "/accounts", "/alerts"];
      if (!u && protectedPaths.includes(pathname)) router.replace("/auth/login");
      if (u && pathname.startsWith("/auth/login")) router.replace("/");
    });
  }, [router, pathname]);

  const signOutNow = async () => {
    await signOut(auth);
    router.replace("/auth/login");
  };

  return <Ctx.Provider value={{ user, loading, signOutNow }}>{children}</Ctx.Provider>;
}
