"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { getOrderById, updateOrderStatus } from "@/lib/firebase/orders";
import { OrderProgress } from "@/components/order/OrderProgress";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/context/ToastContext";
import { cn, formatDate, formatPrice } from "@/lib/utils";
import { ORDER_STATUS_FLOW, ORDER_STATUS_LABEL, type Order, type OrderStatus } from "@/lib/types";

const ALL_STATUSES: OrderStatus[] = [...ORDER_STATUS_FLOW, "cancelled"];

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (!params.id) return;
    getOrderById(params.id)
      .then(setOrder)
      .finally(() => setLoading(false));
  }, [params.id]);

  async function changeStatus(status: OrderStatus) {
    if (!order || status === order.status) return;
    setUpdating(true);
    try {
      await updateOrderStatus(order.id, status);
      setOrder({ ...order, status });
      showToast(`${ORDER_STATUS_LABEL[status]} 상태로 변경했습니다`, "success");
    } finally {
      setUpdating(false);
    }
  }

  async function cancelOrder() {
    if (!order) return;
    setUpdating(true);
    try {
      await updateOrderStatus(order.id, "cancelled");
      setOrder({ ...order, status: "cancelled" });
      showToast("주문이 취소되었습니다", "success");
    } finally {
      setUpdating(false);
      setCancelConfirm(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size={28} className="animate-spin text-ink/25" />
      </div>
    );
  }

  if (!order) {
    return <p className="font-body text-sm text-muted">주문을 찾을 수 없습니다.</p>;
  }

  return (
    <div>
      <p className="font-mono text-xs text-muted">{order.orderNumber}</p>
      <h1 className="mt-1 mb-8 font-display text-2xl text-ink">주문 상세</h1>

      <div className="mb-8 overflow-x-auto rounded-lg border border-line px-6 py-8">
        <OrderProgress status={order.status} />
      </div>

      <div className="mb-8">
        <p className="mb-2 font-body text-xs text-muted">주문 상태 변경 (원하는 상태를 바로 선택하세요)</p>
        <div className="flex flex-wrap gap-2">
          {ALL_STATUSES.map((status) => {
            const isCurrent = order.status === status;
            const isCancel = status === "cancelled";
            return (
              <button
                key={status}
                type="button"
                disabled={updating || isCurrent}
                onClick={() => (isCancel ? setCancelConfirm(true) : changeStatus(status))}
                className={cn(
                  "rounded-full px-3.5 py-1.5 font-body text-xs transition-colors disabled:cursor-not-allowed",
                  isCurrent
                    ? "bg-ink text-ivory"
                    : isCancel
                    ? "border border-red-200 text-red-700 hover:bg-red-50"
                    : "border border-line text-ink/70 hover:border-ink/40"
                )}
              >
                {ORDER_STATUS_LABEL[status]}
              </button>
            );
          })}
        </div>
      </div>

      <section className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <h2 className="mb-3 font-body text-sm font-medium text-ink">구매자 정보</h2>
          <div className="flex flex-col gap-1 font-body text-sm text-ink/80">
            <p>{order.buyerName}</p>
            <p>{order.buyerPhone}</p>
            <p>{order.shippingAddress}</p>
            <p className="text-xs text-muted">{formatDate(order.createdAt)} 주문</p>
          </div>
        </div>
        <div>
          <h2 className="mb-3 font-body text-sm font-medium text-ink">결제 정보</h2>
          <div className="flex justify-between font-body text-sm">
            <span className="text-muted">총 결제금액</span>
            <span className="font-mono text-ink">{formatPrice(order.totalPrice)}</span>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 font-body text-sm font-medium text-ink">주문 상품</h2>
        <ul className="flex flex-col divide-y divide-line border-y border-line">
          {order.items.map((item, i) => (
            <li key={i} className="flex gap-4 py-4">
              <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-md bg-line">
                {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
              </div>
              <div className="flex-1">
                <p className="font-body text-xs text-muted">{item.brand}</p>
                <p className="font-body text-sm text-ink">{item.name}</p>
                <p className="font-body text-xs text-muted">수량 {item.quantity}개</p>
              </div>
              <p className="font-mono text-sm text-ink">{formatPrice(item.price * item.quantity)}</p>
            </li>
          ))}
        </ul>
      </section>

      <ConfirmModal
        open={cancelConfirm}
        title="주문을 취소할까요?"
        description="취소 후에는 되돌릴 수 없습니다."
        confirmLabel="주문 취소"
        danger
        onConfirm={cancelOrder}
        onCancel={() => setCancelConfirm(false)}
      />
    </div>
  );
}
