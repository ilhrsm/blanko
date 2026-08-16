"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllOrdersForAdmin, updateOrderStatus } from "@/lib/firebase/orders";
import { Aperture } from "@/components/ui/Aperture";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/context/ToastContext";
import { formatDate, formatPrice } from "@/lib/utils";
import { ORDER_STATUS_LABEL, type OrderStatus } from "@/lib/types";
import type { Order } from "@/lib/types";

const FILTERS: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "waiting_payment", label: "입금 대기" },
  { value: "payment_checking", label: "입금 확인 중" },
  { value: "paid", label: "결제 완료" },
  { value: "preparing", label: "배송 준비중" },
  { value: "shipping", label: "배송중" },
  { value: "completed", label: "배송 완료" },
  { value: "cancelled", label: "취소" },
];

const STATUS_OPTIONS = FILTERS.filter((f) => f.value !== "all") as {
  value: OrderStatus;
  label: string;
}[];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    getAllOrdersForAdmin()
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  async function handleStatusChange(order: Order, status: OrderStatus) {
    if (status === order.status) return;
    if (status === "cancelled") {
      const ok = window.confirm(`${order.orderNumber} 주문을 취소할까요? 취소 후에는 되돌릴 수 없습니다.`);
      if (!ok) return;
    }
    setUpdatingId(order.id);
    try {
      await updateOrderStatus(order.id, status);
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status } : o)));
      showToast(`${order.orderNumber} 주문을 ${ORDER_STATUS_LABEL[status]}(으)로 변경했습니다`, "success");
    } catch {
      showToast("상태 변경에 실패했습니다", "error");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl text-ink">주문 관리</h1>

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-3.5 py-1.5 font-body text-xs ${
              filter === f.value ? "bg-ink text-ivory" : "border border-line text-ink/70"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Aperture size={28} className="animate-spin text-ink/25" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="해당하는 주문이 없습니다" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] font-body text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-muted">
                <th className="py-3 font-normal">주문번호</th>
                <th className="py-3 font-normal">구매자</th>
                <th className="py-3 font-normal">상품</th>
                <th className="py-3 font-normal">금액</th>
                <th className="py-3 font-normal">날짜</th>
                <th className="py-3 font-normal">상태 (클릭해서 변경)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((order) => (
                <tr key={order.id}>
                  <td className="py-3">
                    <Link href={`/admin/orders/${order.id}`} className="font-mono text-xs text-accent">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="py-3 text-ink/80">{order.buyerName}</td>
                  <td className="py-3 text-ink/80">
                    {order.items[0]?.name}
                    {order.items.length > 1 ? ` 외 ${order.items.length - 1}건` : ""}
                  </td>
                  <td className="py-3 font-mono text-ink">{formatPrice(order.totalPrice)}</td>
                  <td className="py-3 text-ink/60">{formatDate(order.createdAt)}</td>
                  <td className="py-3">
                    <select
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(e) => handleStatusChange(order, e.target.value as OrderStatus)}
                      className="rounded-full border border-line bg-ivory px-2.5 py-1 font-body text-xs text-ink/80 disabled:opacity-50"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
