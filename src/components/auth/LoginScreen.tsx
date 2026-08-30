"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/context/ToastContext";
import { getProductsBySeller } from "@/lib/firebase/products";

export function LoginScreen() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    // 이미 로그인되어 있으면 바로 판매 화면으로 이동
    if (!loading && user) {
      goToSellerHome(user.uid);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  async function goToSellerHome(uid: string) {
    // 등록된 상품이 하나도 없는 신규 셀러라면, 곧바로 "상품 등록" 화면으로 보내서
    // 대시보드/설정을 거치지 않고 바로 판매를 시작할 수 있게 합니다.
    try {
      const products = await getProductsBySeller(uid);
      router.replace(products.length === 0 ? "/admin/products/new" : "/admin");
    } catch {
      router.replace("/admin");
    }
  }

  async function handleLogin() {
    try {
      await signInWithGoogle();
      // signInWithGoogle이 끝나면 useAuth의 user가 채워지고, 위 useEffect가
      // 신규 셀러는 /admin/products/new로, 기존 셀러는 /admin으로 보내줍니다.
    } catch {
      showToast("로그인에 실패했습니다. 다시 시도해주세요", "error");
    }
  }

  if (loading || user) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-white">
        <Spinner size={32} className="animate-spin text-ink/30" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[88vh] flex-col overflow-hidden bg-white px-6 py-10 md:px-16 md:py-14">
      {/* 은은한 배경 악센트 — 톤온톤 네이비 */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-0 h-[520px] w-[520px] rounded-full bg-navy/[0.06] blur-3xl md:-right-24"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 bottom-0 h-[380px] w-[380px] rounded-full bg-navy/[0.03] blur-3xl"
      />

      <div className="flex flex-1 flex-col justify-center gap-14 md:gap-16">
        <div className="flex max-w-xl flex-col gap-6">
          <span className="inline-flex w-fit items-center gap-2 font-body text-xs font-medium tracking-[0.25em] text-navy/70">
            <span className="h-1.5 w-1.5 rounded-full bg-navy" />
            MOBILE STOREFRONT
          </span>

          <h1 className="font-display text-6xl font-extrabold leading-[0.95] tracking-tight text-navy md:text-8xl">
            Shipda
          </h1>

          <p className="font-body text-base text-muted md:text-lg">
            링크 하나로 완성되는 나의 첫 모바일 가판대.
          </p>
        </div>

        <div className="flex flex-col items-start gap-5">
          <button
            onClick={handleLogin}
            className="flex items-center gap-3 rounded-full border border-line bg-white px-7 py-4 font-body text-sm font-medium text-ink shadow-sm transition-colors hover:border-navy/40"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path
                fill="#4285F4"
                d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"
              />
              <path
                fill="#34A853"
                d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"
              />
              <path
                fill="#FBBC05"
                d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33z"
              />
              <path
                fill="#EA4335"
                d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"
              />
            </svg>
            Google로 시작하기
          </button>

          <Link
            href="/signup"
            className="font-body text-xs text-muted underline underline-offset-4 hover:text-ink"
          >
            이메일로 상점아이디 만들고 시작하기
          </Link>
        </div>
      </div>

      <div className="relative flex items-center justify-between border-t border-line pt-6 font-body text-xs text-muted">
        <span>© {new Date().getFullYear()} Shipda</span>
      </div>
    </div>
  );
}
