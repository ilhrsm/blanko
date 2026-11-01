"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import type { Product } from "@/lib/types";

export function ProductDetailActions({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const soldOut = product.stock <= 0;

  return (
    <div className="mt-8 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="font-body text-sm text-muted">수량</span>
        <div className="flex items-center gap-3 rounded-full border border-line px-3 py-1.5">
          <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={soldOut}>
            –
          </button>
          <span className="w-5 text-center font-mono text-sm">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
            disabled={soldOut}
          >
            +
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          variant="secondary"
          fullWidth
          disabled={soldOut}
          onClick={() => {
            addItem(product, quantity);
            showToast("장바구니에 담았습니다", "success");
          }}
        >
          장바구니 담기
        </Button>
        <Button
          fullWidth
          disabled={soldOut}
          onClick={() => {
            addItem(product, quantity);
            router.push("/checkout");
          }}
        >
          {soldOut ? "품절" : "바로 구매하기"}
        </Button>
      </div>
    </div>
  );
}
