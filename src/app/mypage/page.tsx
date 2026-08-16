"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { getOrdersByUser } from "@/lib/firebase/orders";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Aperture } from "@/components/ui/Aperture";
import { formatDate, formatPrice } from "@/lib/utils";
import { ORDER_STATUS_LABEL } from "@/lib/types";
import type { Order } from "@/lib/types";

export default function MyPage() {
  const { user, loading: authLoading, signInWithGoogle, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getOrdersByUser(user.uid)
        .then(setOrders)
        .finally(() => setLoading(false));
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  if (authLoading) return null;

  if (!user) {
    return (
      <div className="mx-auto flex max-w-content flex-col items-center gap-4 px-5 py-24 text-center">
        <p className="font-display text-xl text-ink">로그인이 필요합니다</p>
        <Button onClick={signInWithGoogle}>Google로 로그인</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-content px-5 py-12 md:px-8 md:py-16">
      <div className="mb-10 flex items-center gap-4">
        {user.profileImage ? (
          <Image src={user.profileImage} alt={user.name} width={56} height={56} className="rounded-full" />
        ) : (
          <div className="h-14 w-14 rounded-full bg-line" />
        )}
        <div>
          <p className="font-display text-xl text-ink">{user.name}</p>
          <p className="font-body text-sm text-muted">{user.email}</p>
        </div>
        <button onClick={logout} className="ml-auto font-body text-xs text-muted hover:text-ink">
          로그아웃
        </button>
      </div>

      <h2 className="mb-6 font-display text-xl text-ink">주문 내역</h2>

      {loading ? (
        <div className="flex justify-center py-16">
          <Aperture size={28} className="animate-spin text-ink/25" />
        </div>
      ) : orders.length === 0 ? (
        <EmptyState title="주문 내역이 없습니다" actionLabel="쇼핑 시작하기" actionHref="/shop" />
      ) : (
        <ul className="flex flex-col divide-y divide-line border-y border-line">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/mypage/orders/${order.id}`}
                className="flex items-center justify-between gap-4 py-5"
              >
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-md bg-line">
                    {order.items[0]?.image && (
                      <Image src={order.items[0].image} alt="" fill className="object-cover" />
                    )}
                  </div>
                  <div>
                    <p className="font-mono text-xs text-muted">{order.orderNumber}</p>
                    <p className="font-body text-sm text-ink">
                      {order.items[0]?.name}
                      {order.items.length > 1 ? ` 외 ${order.items.length - 1}건` : ""}
                    </p>
                    <p className="font-body text-xs text-muted">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm text-ink">{formatPrice(order.totalPrice)}</p>
                  <p className="mt-1 font-body text-xs text-accent">{ORDER_STATUS_LABEL[order.status]}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
