"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProductsBySeller } from "@/lib/firebase/products";
import { getAllOrdersForAdmin } from "@/lib/firebase/orders";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS_LABEL } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";

export default function AdminDashboard() {
  const { user } = useAuth();
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

  return (
    <div>
      <h1 className="mb-8 font-display text-2xl font-bold text-ink">대시보드</h1>
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
