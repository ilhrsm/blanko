"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/Button";
import { createOrder } from "@/lib/firebase/orders";
import { getProductById } from "@/lib/firebase/products";
import { getSellerSettings } from "@/lib/firebase/settings";
import type { OrderItem } from "@/lib/types";
import { formatPrice, generateOrderNumber } from "@/lib/utils";
import { useShopHome } from "@/lib/shopHome";

// 결제 흐름 (사업자 등록 없이 쓰는 계좌이체 방식)
// 1) 구매자가 배송 정보를 입력하고 주문하면 'waiting_payment(입금 대기)' 상태의 주문이 만들어집니다.
// 2) /order/[id] 화면에서 판매자가 상점 정보에 등록해둔 계좌번호가 보이고, 구매자가 입금합니다.
// 3) 구매자가 '입금완료'를 누르면 'payment_checking'이 되고, 판매자가 확인 후 상태를 바꿔갑니다.
// 장바구니에 여러 판매자의 상품이 섞여 있으면 판매자별로 주문을 나눠서 만듭니다.

export default function CheckoutPage() {
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const { showToast } = useToast();
  const router = useRouter();
  const shopHome = useShopHome();

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
        <p className="font-display text-xl font-bold text-ink">로그인이 필요합니다</p>
        <p className="font-body text-sm text-muted">주문을 진행하려면 Google 계정으로 로그인해주세요.</p>
        <Button onClick={signInWithGoogle}>Google로 로그인</Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-content flex-col items-center gap-4 px-5 py-24 text-center">
        <p className="font-display text-xl font-bold text-ink">장바구니가 비어있습니다</p>
        <Button variant="secondary" onClick={() => router.push(shopHome)}>
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
      // 1) 각 상품을 파는 셀러를 확인합니다. (예전에 담아둔 장바구니는 sellerId가 없어서 상품을 조회해 채워요)
      const resolved = await Promise.all(
        items.map(async (i) => {
          let sellerId = i.sellerId;
          if (!sellerId) {
            const product = await getProductById(i.productId);
            sellerId = product?.sellerId;
          }
          return { item: i, sellerId };
        })
      );
      if (resolved.some((r) => !r.sellerId)) {
        showToast("판매가 종료되었거나 찾을 수 없는 상품이 있어요. 장바구니를 확인해주세요", "error");
        return;
      }

      // 2) 셀러별로 묶습니다.
      const bySeller = new Map<string, OrderItem[]>();
      for (const { item, sellerId } of resolved) {
        const list = bySeller.get(sellerId!) ?? [];
        list.push({
          productId: item.productId,
          name: item.name,
          brand: item.brand,
          price: item.price,
          image: item.image,
          quantity: item.quantity,
        });
        bySeller.set(sellerId!, list);
      }

      // 3) 셀러가 등록한 입금 계좌를 가져옵니다. 계좌가 없는 셀러가 있으면 주문을 만들기 전에 막아요.
      const sellerIds = Array.from(bySeller.keys());
      const settingsList = await Promise.all(sellerIds.map((id) => getSellerSettings(id)));
      const missing = settingsList.findIndex(
        (st) => !st.bankInfo?.bankName?.trim() || !st.bankInfo?.accountNumber?.trim()
      );
      if (missing !== -1) {
        showToast("판매자가 아직 입금 계좌를 등록하지 않아 주문할 수 없어요. 판매자에게 문의해주세요", "error");
        return;
      }

      // 4) 셀러별로 '입금 대기' 주문을 만듭니다.
      const groupId = `G${Date.now()}`;
      const orderIds: string[] = [];
      for (let idx = 0; idx < sellerIds.length; idx++) {
        const sellerId = sellerIds[idx];
        const orderItems = bySeller.get(sellerId)!;
        const bank = settingsList[idx].bankInfo;
        const id = await createOrder({
          orderNumber: generateOrderNumber(),
          userId: user!.uid,
          sellerId,
          groupId,
          buyerName: name,
          buyerPhone: phone,
          shippingAddress: address,
          items: orderItems,
          totalPrice: orderItems.reduce((sum, it) => sum + it.price * it.quantity, 0),
          status: "waiting_payment",
          bankInfo: {
            bankName: bank.bankName.trim(),
            accountNumber: bank.accountNumber.trim(),
            accountHolder: (bank.accountHolder ?? "").trim(),
          },
        });
        orderIds.push(id);
      }

      clearCart();
      showToast("주문이 접수되었습니다. 안내된 계좌로 입금해주세요", "success");
      router.push(`/order/${orderIds[0]}`);
    } catch (err) {
      console.error("주문 생성 실패", err);
      showToast("주문 처리 중 오류가 발생했습니다", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-12 md:px-8 md:py-16">
      <h1 className="mb-10 font-display text-3xl font-bold text-ink">주문하기</h1>

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
          {submitting ? "주문 접수 중..." : `${formatPrice(totalPrice)} 주문하고 입금 계좌 확인하기`}
        </Button>
        <p className="text-center font-body text-xs text-muted">
          주문 후 안내되는 판매자 계좌로 입금하신 뒤, &apos;입금완료&apos; 버튼을 눌러주세요.
        </p>
      </form>

      <style jsx global>{`
        .checkout-input {
          width: 100%;
          border: 1px solid #ebebeb;
          border-radius: 8px;
          padding: 12px 16px;
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Apple SD Gothic Neo",
            "Pretendard Variable", "Malgun Gothic", sans-serif;
          font-size: 14px;
          background: white;
        }
        .checkout-input:focus {
          outline: 1.5px solid #0a0a0a;
        }
      `}</style>
    </div>
  );
}
