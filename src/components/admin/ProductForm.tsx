"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ImageUploader } from "./ImageUploader";
import { createProduct, updateProduct } from "@/lib/firebase/products";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import type { Product, ProductSpec } from "@/lib/types";

interface ProductFormProps {
  product?: Product;
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(product?.name ?? "");
  const [brand, setBrand] = useState(product?.brand ?? "");
  const [price, setPrice] = useState(product?.price?.toString() ?? "");
  const [stock, setStock] = useState(product?.stock?.toString() ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [hidden, setHidden] = useState(product?.hidden ?? false);
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [specs, setSpecs] = useState<ProductSpec[]>(product?.specs ?? []);
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [coverImage, setCoverImage] = useState(product?.coverImage ?? "");
  const tempId = product?.id ?? `draft-${Date.now()}`;

  function addSpec() {
    setSpecs((prev) => [...prev, { label: "", value: "" }]);
  }
  function updateSpec(index: number, field: "label" | "value", value: string) {
    setSpecs((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  }
  function removeSpec(index: number) {
    setSpecs((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !brand || !price) {
      showToast("필수 항목을 입력해주세요", "error");
      return;
    }
    if (!user) {
      showToast("로그인이 필요합니다", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name,
        brand,
        price: Number(price),
        stock: Number(stock) || 0,
        description,
        hidden,
        featured,
        specs: specs.filter((s) => s.label && s.value),
        images,
        coverImage: coverImage || images[0] || "",
      };
      if (product) {
        await updateProduct(product.id, payload);
        showToast("상품이 수정되었습니다", "success");
        router.push("/admin/products");
      } else {
        await createProduct(user.uid, payload);
        showToast("상품이 등록되었습니다! 이제 판매가 시작됐어요 🎉", "success");
        router.push("/admin/products");
      }
      router.refresh();
    } catch {
      showToast("저장에 실패했습니다", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 pb-24">
      <section>
        <h3 className="mb-3 font-body text-sm font-medium text-ink">상품 이미지</h3>
        <ImageUploader
          sellerId={user?.uid ?? ""}
          productId={tempId}
          images={images}
          coverImage={coverImage}
          onChange={(imgs, cover) => {
            setImages(imgs);
            setCoverImage(cover);
          }}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="상품명 *">
          <input value={name} onChange={(e) => setName(e.target.value)} className="input" required />
        </Field>
        <Field label="브랜드 *">
          <input value={brand} onChange={(e) => setBrand(e.target.value)} className="input" required />
        </Field>
        <Field label="가격 (원) *">
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="input"
            required
          />
        </Field>
        <Field label="재고 수량">
          <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="input" />
        </Field>
      </section>

      <Field label="상품 설명">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          className="input resize-none"
        />
      </Field>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-body text-sm font-medium text-ink">스펙</h3>
          <button type="button" onClick={addSpec} className="font-body text-xs text-accent">
            + 항목 추가
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {specs.map((spec, i) => (
            <div key={i} className="flex gap-2">
              <input
                placeholder="항목 (예: 렌즈)"
                value={spec.label}
                onChange={(e) => updateSpec(i, "label", e.target.value)}
                className="input"
              />
              <input
                placeholder="값 (예: 35mm f/2.8)"
                value={spec.value}
                onChange={(e) => updateSpec(i, "value", e.target.value)}
                className="input"
              />
              <button type="button" onClick={() => removeSpec(i)} className="px-2 text-muted">
                ✕
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="flex gap-6">
        <label className="flex items-center gap-2 font-body text-sm text-ink">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
          추천 상품으로 노출
        </label>
        <label className="flex items-center gap-2 font-body text-sm text-ink">
          <input type="checkbox" checked={hidden} onChange={(e) => setHidden(e.target.checked)} />
          판매 숨김
        </label>
      </section>

      <div className="fixed inset-x-0 bottom-0 border-t border-line bg-surface px-5 py-4 md:static md:border-none md:bg-transparent md:px-0 md:py-0">
        <Button type="submit" disabled={saving} fullWidth className="md:w-auto">
          {saving ? "저장 중..." : product ? "상품 수정 저장" : "상품 등록"}
        </Button>
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          border: 1px solid #e2e2e2;
          border-radius: 8px;
          padding: 10px 14px;
          font-family: var(--font-manrope);
          font-size: 14px;
          background: white;
        }
        .input:focus {
          outline: 1.5px solid #171717;
        }
      `}</style>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-body text-xs text-muted">{label}</span>
      {children}
    </label>
  );
}
