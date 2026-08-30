import { ProductForm } from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="mb-2 font-display text-2xl text-ink">첫 상품을 등록해보세요</h1>
      <p className="mb-8 font-body text-sm text-muted">
        상품을 등록하면 바로 내 쇼핑몰에서 판매가 시작돼요. 나중에 언제든 수정할 수 있어요.
      </p>
      <ProductForm />
    </div>
  );
}
