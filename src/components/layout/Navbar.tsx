"use client";

import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { MobileMenu } from "./MobileMenu";

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/mypage", label: "Order" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const { user, signInWithGoogle, logout } = useAuth();
  const { totalCount, openCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-ivory/90 backdrop-blur">
      <div className="mx-auto flex max-w-content items-center justify-between px-5 py-4 md:px-8">
        <button
          className="md:hidden"
          aria-label="메뉴 열기"
          onClick={() => setMenuOpen(true)}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M2 6h18M2 11h18M2 16h18" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </button>

        <Link href="/" className="font-display text-xl tracking-tight text-ink md:text-2xl">
          SMALLCAM
        </Link>

        <nav className="hidden items-center gap-9 font-body text-sm text-ink/80 md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-ink">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/shop" aria-label="검색" className="hidden md:block">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" />
              <path d="M16 16l-3.5-3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </Link>

          <button aria-label="장바구니" onClick={openCart} className="relative">
            <svg width="19" height="19" viewBox="0 0 19 19" fill="none">
              <path
                d="M2 5h15l-1.4 8.4a1.5 1.5 0 01-1.48 1.26H4.88a1.5 1.5 0 01-1.48-1.26L2 5z"
                stroke="currentColor"
                strokeWidth="1.3"
              />
              <path d="M6 5a3.5 3.5 0 017 0" stroke="currentColor" strokeWidth="1.3" />
            </svg>
            {totalCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] text-ivory">
                {totalCount}
              </span>
            )}
          </button>

          {user ? (
            <Link href="/mypage" aria-label="마이페이지">
              {user.profileImage ? (
                <Image
                  src={user.profileImage}
                  alt={user.name}
                  width={28}
                  height={28}
                  className="rounded-full"
                />
              ) : (
                <div className="h-7 w-7 rounded-full bg-ink/10" />
              )}
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
        links={NAV_LINKS}
        user={user}
        onSignIn={signInWithGoogle}
        onSignOut={logout}
      />
    </header>
  );
}
