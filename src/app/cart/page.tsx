"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, removeItem, setQuantity, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-content px-5 py-16">
        <EmptyState
          title="장바구니가 비어있습니다"
          description="마음에 드는 카메라를 담아보세요."
          actionLabel="쇼핑 계속하기"
          actionHref="/shop"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-content px-5 py-12 md:px-8 md:py-16">
      <h1 className="mb-10 font-display text-3xl text-ink">장바구니</h1>

      <div className="flex flex-col gap-10 md:flex-row">
        <ul className="flex-1 divide-y divide-line">
          {items.map((item) => (
            <li key={item.productId} className="flex gap-4 py-6">
              <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-md bg-line">
                {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <p className="font-body text-xs text-muted">{item.brand}</p>
                  <p className="font-body text-base text-ink">{item.name}</p>
                  <p className="mt-1 font-mono text-sm text-ink">{formatPrice(item.price)}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 rounded-full border border-line px-3 py-1.5">
                    <button onClick={() => setQuantity(item.productId, item.quantity - 1)}>–</button>
                    <span className="w-5 text-center font-mono text-sm">{item.quantity}</span>
                    <button onClick={() => setQuantity(item.productId, item.quantity + 1)}>+</button>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="font-body text-xs text-muted hover:text-ink"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="h-fit w-full rounded-lg border border-line p-6 md:w-80">
          <div className="flex justify-between font-body text-sm">
            <span className="text-muted">총 상품금액</span>
            <span className="font-mono text-ink">{formatPrice(totalPrice)}</span>
          </div>
          <div className="mt-6 flex justify-between font-body text-base">
            <span className="text-ink">총 결제금액</span>
            <span className="font-mono text-ink">{formatPrice(totalPrice)}</span>
          </div>
          <Link href="/checkout" className="mt-6 block">
            <Button fullWidth>주문하기</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
