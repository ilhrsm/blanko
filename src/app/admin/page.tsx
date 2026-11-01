"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProductsBySeller } from "@/lib/firebase/products";
import { getAllOrdersForAdmin } from "@/lib/firebase/orders";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS_LABEL } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [productCount, setProductCount] = useState<number | null>(null);
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [revenue, setRevenue] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    getProductsBySeller(user.uid).then((p) => setProductCount(p.length));
    // 주문(orders)은 아직 셀러별로 분리되지 않았습니다 — 안내 참고
    getAllOrdersForAdmin().then((orders) => {
      setPendingCount(orders.filter((o) => o.status === "payment_checking").length);
      setRevenue(
        orders
          .filter((o) => o.status !== "cancelled" && o.status !== "waiting_payment")
          .reduce((sum, o) => sum + o.totalPrice, 0)
      );
    });
  }, [user]);

  const stallPath = user ? `/${user.storeId || user.uid}` : null;

  async function copyStallUrl() {
    if (!stallPath) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${stallPath}`);
      showToast("가판대 주소가 복사되었습니다", "success");
    } catch {
      showToast("복사에 실패했어요. 주소를 직접 선택해 복사해주세요.", "error");
    }
  }

  return (
    <div>
      <h1 className="mb-8 font-display text-2xl font-bold text-ink">대시보드</h1>
      {stallPath && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line p-6">
          <div className="min-w-0">
            <p className="font-body text-xs text-muted">나의 가판대 주소</p>
            <a
              href={stallPath}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block break-all font-display text-lg font-bold text-ink underline-offset-4 hover:underline"
            >
              {typeof window !== "undefined" ? window.location.host : ""}
              {stallPath}
            </a>
            <p className="mt-1 font-body text-xs text-muted">
              이 주소를 인스타그램 프로필이나 피드에 걸어보세요.
            </p>
          </div>
          <button
            type="button"
            onClick={copyStallUrl}
            className="rounded-full border border-ink/15 px-5 py-2 font-body text-sm font-medium text-ink transition-colors hover:border-ink/40"
          >
            주소 복사
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="전체 상품" value={productCount === null ? "–" : `${productCount}개`} />
        <StatCard
          label="입금 확인 대기"
          value={pendingCount === null ? "–" : `${pendingCount}건`}
          href="/admin/orders"
        />
        <StatCard label="누적 매출" value={revenue === null ? "–" : formatPrice(revenue)} />
      </div>
      <p className="mt-1 font-body text-xs text-muted">
        * 누적 매출은 {ORDER_STATUS_LABEL.paid} 이후 상태의 주문 합계입니다.
      </p>
    </div>
  );
}

function StatCard({ label, value, href }: { label: string; value: string; href?: string }) {
  const content = (
    <div className="rounded-lg border border-line p-6">
      <p className="font-body text-xs text-muted">{label}</p>
      <p className="mt-2 font-display text-2xl font-bold text-ink">{value}</p>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}
