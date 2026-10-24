"use client";

import Link from "next/link";
import type { AppUser } from "@/lib/types";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  links: { href: string; label: string }[];
  user: AppUser | null;
  onSignIn: () => void;
  onSignOut: () => void;
}

export function MobileMenu({ open, onClose, links, user, onSignIn, onSignOut }: MobileMenuProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-ivory md:hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <span className="font-display text-xl font-bold text-ink">Shipda</span>
        <button aria-label="닫기" onClick={onClose}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </button>
      </div>

      <nav className="flex flex-col gap-1 px-5 pt-6">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className="border-b border-line py-4 font-display text-2xl font-bold text-ink"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="px-5 pt-8">
        {user ? (
          <div className="flex flex-col gap-3">
            <Link href="/mypage" onClick={onClose} className="font-body text-sm text-ink">
              마이페이지
            </Link>
            <button onClick={() => { onSignOut(); onClose(); }} className="text-left font-body text-sm text-muted">
              로그아웃
            </button>
          </div>
        ) : (
          <button onClick={() => { onSignIn(); onClose(); }} className="font-body text-sm text-ink">
            Google로 로그인
          </button>
        )}
      </div>
    </div>
  );
}
