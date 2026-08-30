"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getProductsBySeller, updateProduct, deleteProduct } from "@/lib/firebase/products";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Aperture } from "@/components/ui/Aperture";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/types";

export default function AdminProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const { showToast } = useToast();

  function reload() {
    if (!user) return;
    setLoading(true);
    getProductsBySeller(user.uid)
      .then(setProducts)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function toggleHidden(product: Product) {
    await updateProduct(product.id, { hidden: !product.hidden });
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, hidden: !p.hidden } : p))
    );
    showToast(product.hidden ? "판매를 재개했습니다" : "판매를 숨겼습니다", "success");
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await deleteProduct(deleteTarget.id);
    setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    showToast("상품이 삭제되었습니다", "success");
    setDeleteTarget(null);
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink">상품 관리</h1>
        <Link href="/admin/products/new">
          <Button>상품 추가</Button>
        </Link>
      </div>
      {user && (
        <Link
          href={`/${user.uid}`}
          target="_blank"
          className="mb-8 inline-block font-body text-xs text-accent underline"
        >
          내 쇼핑몰 보러가기 →
        </Link>
      )}
      {!user && <div className="mb-8" />}

      {loading ? (
        <div className="flex justify-center py-16">
          <Aperture size={28} className="animate-spin text-ink/25" />
        </div>
      ) : products.length === 0 ? (
        <EmptyState title="등록된 상품이 없습니다" actionLabel="상품 추가하기" actionHref="/admin/products/new" />
      ) : (
        <ul className="flex flex-col divide-y divide-line border-y border-line">
          {products.map((product) => (
            <li key={product.id} className="flex flex-wrap items-center gap-4 py-4">
              <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-md bg-line">
                {product.coverImage && (
                  <Image src={product.coverImage} alt={product.name} fill className="object-cover" />
                )}
              </div>
              <div className="min-w-[10rem] flex-1">
                <p className="font-body text-xs text-muted">{product.brand}</p>
                <p className="font-body text-sm text-ink">{product.name}</p>
                <p className="font-mono text-xs text-ink">{formatPrice(product.price)}</p>
              </div>
              <p className="font-body text-xs text-muted">재고 {product.stock}</p>
              <span
                className={`rounded-full px-2.5 py-1 font-body text-[11px] ${
                  product.hidden ? "bg-line text-muted" : "bg-accent/10 text-accent"
                }`}
              >
                {product.hidden ? "숨김" : "판매중"}
              </span>
              <div className="ml-auto flex gap-2">
                <button
                  onClick={() => toggleHidden(product)}
                  className="rounded-full border border-line px-3 py-1.5 font-body text-xs text-ink/70 hover:border-ink/40"
                >
                  {product.hidden ? "노출" : "숨김"}
                </button>
                <Link
                  href={`/admin/products/${product.id}`}
                  className="rounded-full border border-line px-3 py-1.5 font-body text-xs text-ink/70 hover:border-ink/40"
                >
                  수정
                </Link>
                <button
                  onClick={() => setDeleteTarget(product)}
                  className="rounded-full border border-line px-3 py-1.5 font-body text-xs text-red-700 hover:border-red-300"
                >
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="상품을 삭제할까요?"
        description={`${deleteTarget?.name ?? ""} 상품이 영구적으로 삭제됩니다.`}
        confirmLabel="삭제"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
