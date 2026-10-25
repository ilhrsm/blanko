"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Spinner } from "@/components/ui/Spinner";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
      return;
    }
    // 아직 가판대(상점아이디)를 만들지 않은 구글 로그인 셀러는 가판대 만들기 화면으로 보냅니다.
    if (!loading && user && !user.storeId) {
      router.replace("/setup");
    }
  }, [user, loading, router]);

  if (loading || !user || !user.storeId) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Spinner size={32} className="animate-spin text-ink/30" />
      </div>
    );
  }

  return <>{children}</>;
}
