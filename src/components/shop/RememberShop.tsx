"use client";

import { useEffect } from "react";
import { rememberShop } from "@/lib/shopHome";

// 화면에는 아무것도 그리지 않고, 구매자가 보고 있는 상점을 기억만 합니다.
export function RememberShop({ slug }: { slug: string }) {
  useEffect(() => {
    if (slug) rememberShop(slug);
  }, [slug]);
  return null;
}
