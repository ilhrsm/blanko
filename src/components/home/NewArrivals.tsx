import Link from "next/link";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product/ProductCard";

export function NewArrivals({ products }: { products: Product[] }) {
  const items = [...products].sort((a, b) => b.createdAt - a.createdAt).slice(0, 4);
  if (items.length === 0) return null;
  return (
    <section className="bg-surface">
      <div className="mx-auto max-w-content px-5 py-16 md:px-8 md:py-24">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="font-mono text-xs tracking-[0.2em] text-muted">JUST IN</p>
            <h2 className="font-display text-2xl text-ink md:text-3xl">최신 상품</h2>
          </div>
          <Link href="/shop" className="font-body text-sm text-muted hover:text-ink">
            전체 보기
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-x-6">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
