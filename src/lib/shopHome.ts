"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

// 구매자가 마지막으로 본 상점 주소(상점아이디)를 기억해서,
// Shipda 로고/"쇼핑 계속하기" 등이 로그인 화면(/)이 아니라 그 상점으로 돌아가게 합니다.
const KEY = "shipda_last_shop";
const EVENT = "shipda-shop-change";

// 상점 페이지가 아닌 고정 경로들 (/[sellerId] 와 구분하기 위함)
const RESERVED = ["admin", "editor", "login", "signup", "setup", "cart", "checkout", "mypage", "product", "order"];

export function rememberShop(slug: string) {
  try {
    window.localStorage.setItem(KEY, slug);
    window.dispatchEvent(new Event(EVENT));
  } catch {
    // 저장소를 못 쓰는 환경이면 그냥 무시
  }
}

function readShop(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

// 지금 화면에서 "홈"으로 가야 할 주소를 돌려줍니다. 기억된 상점이 없으면 "/" 입니다.
export function useShopHome(): string {
  const pathname = usePathname();
  const [last, setLast] = useState<string | null>(null);

  useEffect(() => {
    setLast(readShop());
    const onChange = () => setLast(readShop());
    window.addEventListener(EVENT, onChange);
    return () => window.removeEventListener(EVENT, onChange);
  }, [pathname]);

  const first = pathname.split("/").filter(Boolean)[0];
  // 지금 보고 있는 화면 자체가 상점이면 그 상점으로
  if (first && !RESERVED.includes(first)) return `/${first}`;
  return last ? `/${last}` : "/";
}
