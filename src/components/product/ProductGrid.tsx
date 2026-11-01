import type { CardLayout, CardRatio, Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

const LAYOUT_CLASS: Record<CardLayout, string> = {
  compact: "grid-cols-2 md:grid-cols-4",
  cozy: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  wide: "grid-cols-2 lg:grid-cols-3",
};

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  layout?: CardLayout;
  ratio?: CardRatio;
  accentColor?: string;
  // 슬라이드 배경이 어두울 때도 상품 이름이 읽히도록 슬라이드 글씨색을 넘겨받습니다.
  textColor?: string;
}

export function ProductGrid({
  products,
  loading,
  layout = "cozy",
  ratio = "portrait",
  accentColor,
  textColor,
}: ProductGridProps) {
  const gridClass = `grid gap-x-4 gap-y-8 md:gap-x-6 ${LAYOUT_CLASS[layout]}`;

  if (loading) {
    return (
      <div className={gridClass}>
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        title="상품이 없습니다"
        description="곧 새로운 상품으로 찾아뵙겠습니다."
        textColor={textColor}
      />
    );
  }

  return (
    <div className={gridClass}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          ratio={ratio}
          accentColor={accentColor}
          textColor={textColor}
        />
      ))}
    </div>
  );
}
