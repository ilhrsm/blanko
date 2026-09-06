"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { MobileMenu } from "./MobileMenu";

// 판매자 유입용 랜딩(/), 인증 페이지, 셀러 어드민(/admin/**)에서는
// 쇼핑용 장바구니/로그인 아이콘이 불필요한 군더더기이므로 로고만 노출합니다.
const MINIMAL_ROUTES = ["/", "/login", "/signup"];

export function Navbar() {
  const { user, signInWithGoogle, logout } = useAuth();
  const { totalCount, openCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // 랜딩 화면(/)은 큰 워드마크가 이미 있어서 상단 로고를 다시 보여주면 중복입니다.
  if (pathname === "/") {
    return null;
  }

  // 가판대 편집 화면은 실제 쇼핑몰처럼 보이는 게 중요해서, 여기서만 대시보드로
  // 돌아가는 링크와 실제 화면 보기 링크를 로고 옆에 함께 보여줍니다.
  if (pathname === "/editor") {
    return (
      <header className="sticky top-0 z-50 border-b border-line bg-white">
        <div className="mx-auto flex max-w-content items-center justify-between px-5 py-4 md:px-8">
          <Link href="/admin" className="font-body text-sm text-ink/70 hover:text-ink">
            ← 대시보드
          </Link>
          <Link href="/" className="font-display text-lg font-bold text-ink">
            Shipda
          </Link>
          <Link
            href={`/${user?.storeId || user?.uid}`}
            target="_blank"
            className="font-body text-sm text-ink/70 underline underline-offset-2 hover:text-ink"
          >
            실제 화면 보기 ↗
          </Link>
        </div>
      </header>
    );
  }

  const isMinimal = MINIMAL_ROUTES.includes(pathname) || pathname.startsWith("/admin");

  if (isMinimal) {
    return (
      <header className="sticky top-0 z-50 bg-white">
        <div className="mx-auto flex max-w-content items-center px-5 py-6 md:px-8">
          <Link href="/" className="font-display text-xl font-bold text-ink md:text-2xl">
            Shipda
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 bg-white">
      <div className="mx-auto flex max-w-content items-center justify-between px-5 py-6 md:px-8">
        <button
          className="md:hidden"
          aria-label="메뉴 열기"
          onClick={() => setMenuOpen(true)}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M2 6h18M2 11h18M2 16h18" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </button>

        <Link href="/" className="font-display text-xl font-bold text-ink md:text-2xl">
          Shipda
        </Link>

        <div className="flex items-center gap-5">
          <button
            aria-label="장바구니"
            onClick={openCart}
            className="relative font-body text-sm text-ink/80 hover:text-ink"
          >
            장바구니{totalCount > 0 ? ` (${totalCount})` : ""}
          </button>

          {user ? (
            <Link
              href="/mypage"
              className="hidden font-body text-sm text-ink/80 hover:text-ink md:block"
            >
              마이페이지
            </Link>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="hidden font-body text-sm text-ink/80 hover:text-ink md:block"
            >
              로그인
            </button>
          )}
        </div>
      </div>

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        links={[]}
        user={user}
        onSignIn={signInWithGoogle}
        onSignOut={logout}
      />
    </header>
  );
}
