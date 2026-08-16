"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getProductById } from "@/lib/firebase/products";
import { ProductForm } from "@/components/admin/ProductForm";
import { Aperture } from "@/components/ui/Aperture";
import type { Product } from "@/lib/types";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    getProductById(params.id)
      .then(setProduct)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Aperture size={28} className="animate-spin text-ink/25" />
      </div>
    );
  }

  if (!product) {
    return <p className="font-body text-sm text-muted">상품을 찾을 수 없습니다.</p>;
  }

  return (
    <div>
      <h1 className="mb-8 font-display text-2xl text-ink">상품 수정</h1>
      <ProductForm product={product} />
    </div>
  );
}
