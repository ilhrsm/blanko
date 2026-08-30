"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getOrderById } from "@/lib/firebase/orders";
import { OrderProgress } from "@/components/order/OrderProgress";
import { Spinner } from "@/components/ui/Spinner";
import { formatDate, formatPrice } from "@/lib/utils";
import type { Order } from "@/lib/types";

export default function MyOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    getOrderById(params.id)
      .then(setOrder)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Spinner size={32} className="animate-spin text-ink/25" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-content px-5 py-24 text-center">
        <p className="font-display text-xl text-ink">주문 정보를 찾을 수 없습니다</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-12 md:px-8 md:py-16">
      <p className="font-mono text-xs text-muted">{order.orderNumber}</p>
      <h1 className="mt-1 font-display text-2xl text-ink">주문 상세</h1>
      <p className="mt-1 font-body text-xs text-muted">{formatDate(order.createdAt)} 주문</p>

      <div className="mt-8 overflow-x-auto rounded-lg border border-line px-6 py-8">
        <OrderProgress status={order.status} />
      </div>

      <section className="mt-10">
        <h2 className="mb-4 font-body text-sm font-medium text-ink">주문 상품</h2>
        <ul className="flex flex-col divide-y divide-line border-y border-line">
          {order.items.map((item, i) => (
            <li key={i} className="flex gap-4 py-4">
              <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-md bg-line">
                {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
              </div>
              <div className="flex-1">
                <p className="font-body text-xs text-muted">{item.brand}</p>
                <p className="font-body text-sm text-ink">{item.name}</p>
                <p className="font-body text-xs text-muted">수량 {item.quantity}개</p>
                <Link
                  href={`/product/${item.productId}`}
                  className="mt-1.5 inline-block font-body text-xs text-accent hover:text-ink/70"
                >
                  내 상품 보기
                </Link>
              </div>
              <p className="font-mono text-sm text-ink">{formatPrice(item.price * item.quantity)}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div>
          <h2 className="mb-3 font-body text-sm font-medium text-ink">배송 정보</h2>
          <div className="flex flex-col gap-1 font-body text-sm text-ink/80">
            <p>{order.buyerName}</p>
            <p>{order.buyerPhone}</p>
            <p>{order.shippingAddress}</p>
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
    </div>
  );
}
