"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/Button";
import { createOrder } from "@/lib/firebase/orders";
import { formatPrice, generateOrderNumber } from "@/lib/utils";

// Shipda는 사업자 등록증 없이도 누구나 바로 판매할 수 있도록, 실제 PG(카드/계좌이체)
// 연동 대신 "가결제"로 주문을 즉시 완료 처리합니다. 결제 버튼을 누르면 바로
// status가 'paid'로 생성되어 셀러가 곧바로 주문을 확인/배송 준비할 수 있어요.
// 참고: 장바구니는 아직 셀러별로 완전히 분리되지 않았습니다(스몰캠11 코드베이스의
// 기존 한계이며, 향후 장바구니 상품의 sellerId 기준 분리가 필요합니다).

export default function CheckoutPage() {
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const { showToast } = useToast();
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) setName((prev) => prev || user.name);
  }, [user]);

  if (authLoading) return null;

  if (!user) {
    return (
      <div className="mx-auto flex max-w-content flex-col items-center gap-4 px-5 py-24 text-center">
        <p className="font-display text-xl text-ink">로그인이 필요합니다</p>
        <p className="font-body text-sm text-muted">주문을 진행하려면 Google 계정으로 로그인해주세요.</p>
        <Button onClick={signInWithGoogle}>Google로 로그인</Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-content flex-col items-center gap-4 px-5 py-24 text-center">
        <p className="font-display text-xl text-ink">장바구니가 비어있습니다</p>
        <Button variant="secondary" onClick={() => router.push("/")}>
          쇼핑 계속하기
        </Button>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !phone || !address) {
      showToast("배송 정보를 모두 입력해주세요", "error");
      return;
    }
    setSubmitting(true);
    try {
      // 가결제: 실제 PG 연동 없이 즉시 결제 완료 처리합니다.
      const orderId = await createOrder({
        orderNumber: generateOrderNumber(),
        userId: user!.uid,
        buyerName: name,
        buyerPhone: phone,
        shippingAddress: address,
        items: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          brand: i.brand,
          price: i.price,
          image: i.image,
          quantity: i.quantity,
        })),
        totalPrice,
        status: "paid",
        bankInfo: { bankName: "가결제", accountNumber: "-", accountHolder: "Shipda" },
      });
      clearCart();
      showToast("가결제가 완료되었습니다", "success");
      router.push(`/order/${orderId}`);
    } catch {
      showToast("주문 처리 중 오류가 발생했습니다", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-12 md:px-8 md:py-16">
      <h1 className="mb-10 font-display text-3xl text-ink">주문하기</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <section>
          <h2 className="mb-4 font-body text-sm font-medium text-ink">배송 정보</h2>
          <div className="flex flex-col gap-3">
            <input
              placeholder="받으실 분 성함"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="checkout-input"
              required
            />
            <input
              placeholder="연락처 (010-0000-0000)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="checkout-input"
              required
            />
            <input
              placeholder="배송 주소"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="checkout-input"
              required
            />
          </div>
        </section>

        <section className="rounded-lg border border-line p-5">
          <h2 className="mb-4 font-body text-sm font-medium text-ink">주문 상품</h2>
          <ul className="flex flex-col gap-3">
            {items.map((item) => (
              <li key={item.productId} className="flex justify-between font-body text-sm">
                <span className="text-ink/80">
                  {item.name} × {item.quantity}
                </span>
                <span className="font-mono text-ink">{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-line pt-4 font-body text-base">
            <span className="text-ink">총 결제금액</span>
            <span className="font-mono text-ink">{formatPrice(totalPrice)}</span>
          </div>
        </section>

        <Button type="submit" disabled={submitting} fullWidth>
          {submitting ? "결제 처리 중..." : `가결제로 ${formatPrice(totalPrice)} 결제하기`}
        </Button>
        <p className="text-center font-body text-xs text-muted">
          사업자 등록 없이도 바로 결제되는 가결제로 진행돼요.
        </p>
      </form>

      <style jsx global>{`
        .checkout-input {
          width: 100%;
          border: 1px solid #e2e2e2;
          border-radius: 8px;
          padding: 12px 16px;
          font-family: var(--font-manrope);
          font-size: 14px;
          background: white;
        }
        .checkout-input:focus {
          outline: 1.5px solid #171717;
        }
      `}</style>
    </div>
  );
}
