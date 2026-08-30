"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "대시보드" },
  { href: "/admin/products", label: "상품 관리" },
  { href: "/admin/orders", label: "주문 관리" },
  { href: "/admin/settings", label: "메인 페이지 관리" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-full shrink-0 border-b border-line md:w-56 md:border-b-0 md:border-r">
      <nav className="flex gap-1 overflow-x-auto px-4 py-3 md:flex-col md:px-4 md:py-8">
        {LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "whitespace-nowrap rounded-full px-4 py-2 font-body text-sm transition-colors md:rounded-md",
                active ? "bg-ink text-ivory" : "text-ink/70 hover:bg-ink/5"
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
