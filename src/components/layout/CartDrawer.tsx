"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, setQuantity, totalPrice } = useCart();

  return (
    <>
      <div
        className={`fixed inset-0 z-[95] bg-ink/30 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeCart}
      />
      <aside
        className={`fixed right-0 top-0 z-[96] flex h-full w-full max-w-sm flex-col bg-surface transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <p className="font-display text-lg text-ink">장바구니</p>
          <button aria-label="닫기" onClick={closeCart}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 3l12 12M15 3L3 15" stroke="currentColor" strokeWidth="1.3" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <EmptyState title="장바구니가 비어있습니다" description="마음에 드는 카메라를 담아보세요." />
          ) : (
            <ul className="flex flex-col gap-5">
              {items.map((item) => (
                <li key={item.productId} className="flex gap-4">
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-md bg-line">
                    {item.image && (
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <p className="font-body text-xs text-muted">{item.brand}</p>
                      <p className="font-body text-sm text-ink">{item.name}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 rounded-full border border-line px-2 py-1">
                        <button
                          onClick={() => setQuantity(item.productId, item.quantity - 1)}
                          className="h-5 w-5 text-sm text-ink/70"
                        >
                          –
                        </button>
                        <span className="w-4 text-center font-mono text-xs">{item.quantity}</span>
                        <button
                          onClick={() => setQuantity(item.productId, item.quantity + 1)}
                          className="h-5 w-5 text-sm text-ink/70"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-mono text-xs text-ink">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                  <button
                    aria-label="삭제"
                    onClick={() => removeItem(item.productId)}
                    className="self-start text-muted hover:text-ink"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-line px-6 py-5">
            <div className="mb-4 flex items-center justify-between font-body text-sm">
              <span className="text-muted">총 결제금액</span>
              <span className="font-mono text-base text-ink">{formatPrice(totalPrice)}</span>
            </div>
            <Link href="/cart" onClick={closeCart}>
              <Button fullWidth>장바구니 보기</Button>
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
