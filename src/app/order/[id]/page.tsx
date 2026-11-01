"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getOrderById, getOrdersByUser, updateOrderStatus } from "@/lib/firebase/orders";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import type { Order } from "@/lib/types";
import { Spinner } from "@/components/ui/Spinner";

export default function OrderConfirmationPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  // 같이 주문했지만 다른 판매자라 따로 입금해야 하는 주문들
  const [siblings, setSiblings] = useState<Order[]>([]);
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    getOrderById(params.id)
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  useEffect(() => {
    if (!user || !order?.groupId) {
      setSiblings([]);
      return;
    }
    getOrdersByUser(user.uid)
      .then((list) =>
        setSiblings(
          list.filter(
            (o) => o.groupId === order.groupId && o.id !== order.id && o.status === "waiting_payment"
          )
        )
      )
      .catch(() => setSiblings([]));
  }, [user, order?.groupId, order?.id]);

  async function copyAccount() {
    if (!order) return;
    try {
      await navigator.clipboard.writeText(order.bankInfo.accountNumber);
      showToast("계좌번호가 복사되었습니다", "success");
    } catch {
      showToast("복사에 실패했어요. 계좌번호를 직접 선택해 복사해주세요", "error");
    }
  }

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
        <p className="font-display text-xl font-bold text-ink">주문 정보를 찾을 수 없습니다</p>
      </div>
    );
  }

  async function handleConfirmPayment() {
    setConfirming(true);
    try {
      await updateOrderStatus(order!.id, "payment_checking");
      setOrder({ ...order!, status: "payment_checking" });
      showToast("입금 확인 요청이 접수되었습니다", "success");
    } catch {
      showToast("처리 중 오류가 발생했습니다", "error");
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-16 md:px-8 md:py-24">
      <div className="text-center">
        <p className="font-mono text-xs tracking-[0.2em] text-muted">ORDER CONFIRMED</p>
        <h1 className="mt-2 font-display text-2xl font-bold text-ink md:text-3xl">주문이 접수되었습니다</h1>
        <p className="mt-2 font-mono text-sm text-muted">주문번호 {order.orderNumber}</p>
      </div>

      <div className="mt-10 rounded-lg border border-line p-6">
        <p className="font-body text-sm font-medium text-ink">입금 계좌 안내</p>
        <div className="mt-4 flex flex-col gap-2 font-body text-sm">
          <div className="flex justify-between">
            <span className="text-muted">은행</span>
            <span className="text-ink">{order.bankInfo.bankName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">계좌번호</span>
            <span className="flex items-center gap-2">
              <span className="font-mono text-ink">{order.bankInfo.accountNumber}</span>
              <button
                type="button"
                onClick={copyAccount}
                className="rounded-full border border-line px-2.5 py-0.5 font-body text-[11px] text-ink/70 hover:border-ink/40"
              >
                복사
              </button>
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">예금주</span>
            <span className="text-ink">{order.bankInfo.accountHolder}</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-line pt-3">
            <span className="text-ink">결제 금액</span>
            <span className="font-mono text-ink">{formatPrice(order.totalPrice)}</span>
          </div>
        </div>

        {order.status === "waiting_payment" ? (
          <>
            <p className="mt-6 rounded-md bg-ivory px-4 py-3 font-body text-xs text-ink/70">
              위 계좌로 {formatPrice(order.totalPrice)}을 입금하신 뒤, 아래 입금완료 버튼을 눌러주세요.
              판매자가 입금을 확인하면 다음 단계로 넘어갑니다.
            </p>
            <Button fullWidth className="mt-4" onClick={handleConfirmPayment} disabled={confirming}>
              {confirming ? "처리 중..." : "입금완료"}
            </Button>
          </>
        ) : (
          <p className="mt-6 rounded-md bg-ivory px-4 py-3 text-center font-body text-xs text-ink/70">
            입금 확인 요청이 접수되었습니다. 확인 후 순차적으로 배송을 준비합니다.
          </p>
        )}
      </div>

      {siblings.length > 0 && (
        <div className="mt-6 rounded-lg border border-line p-5">
          <p className="font-body text-sm font-medium text-ink">다른 판매자 상품도 함께 주문하셨어요</p>
          <p className="mt-1 font-body text-xs text-muted">
            판매자마다 입금 계좌가 달라서 주문이 나뉘었어요. 아래 주문도 각각 입금해주세요.
          </p>
          <ul className="mt-3 flex flex-col gap-2">
            {siblings.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/order/${o.id}`}
                  className="flex items-center justify-between rounded-md bg-ivory px-4 py-3 font-body text-sm text-ink hover:bg-line/60"
                >
                  <span>
                    {o.items[0]?.name}
                    {o.items.length > 1 ? ` 외 ${o.items.length - 1}건` : ""}
                  </span>
                  <span className="font-mono">{formatPrice(o.totalPrice)} · 입금 안내 보기</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 flex justify-center gap-4">
        <Link href="/mypage">
          <Button variant="secondary">주문 내역 보기</Button>
        </Link>
        <Link href="/">
          <Button variant="ghost">쇼핑 계속하기</Button>
        </Link>
      </div>
    </div>
  );
}
