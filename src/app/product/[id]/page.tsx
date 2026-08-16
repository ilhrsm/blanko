import { notFound } from "next/navigation";
import { getProductById, getVisibleProductsBySeller } from "@/lib/firebase/products";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductDetailActions } from "./ProductDetailActions";
import { ProductGrid } from "@/components/product/ProductGrid";
import { formatPrice } from "@/lib/utils";

interface Props {
  params: { id: string };
}

export const revalidate = 60;

export async function generateMetadata({ params }: Props) {
  const product = await getProductById(params.id).catch(() => null);
  return { title: product ? `${product.name} | SmallCam` : "SmallCam" };
}

export default async function ProductDetailPage({ params }: Props) {
  const product = await getProductById(params.id).catch(() => null);
  if (!product || product.hidden) notFound();

  const related = (await getVisibleProductsBySeller(product.sellerId).catch(() => []))
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-content px-5 py-10 md:px-8 md:py-16">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16">
        <ProductGallery images={product.images.length ? product.images : [product.coverImage]} name={product.name} />

        <div className="flex flex-col">
          <p className="font-body text-sm uppercase tracking-wide text-muted">{product.brand}</p>
          <h1 className="mt-1 font-display text-3xl text-ink">{product.name}</h1>
          <p className="mt-3 font-mono text-xl text-ink">{formatPrice(product.price)}</p>

          <p className="mt-6 whitespace-pre-line font-body text-sm leading-relaxed text-ink/80">
            {product.description}
          </p>

          {product.specs.length > 0 && (
            <div className="mt-8 divide-y divide-line border-y border-line">
              {product.specs.map((spec, i) => (
                <div key={i} className="flex justify-between py-3 font-body text-sm">
                  <span className="text-muted">{spec.label}</span>
                  <span className="text-ink">{spec.value}</span>
                </div>
              ))}
            </div>
          )}

          <p className="mt-6 font-body text-xs text-muted">
            {product.stock > 0 ? `재고 ${product.stock}개 남음` : "일시 품절"}
          </p>

          <ProductDetailActions product={product} />
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-24">
          <p className="mb-6 font-display text-xl text-ink">함께 보면 좋은 상품</p>
          <ProductGrid products={related} />
        </div>
      )}
    </div>
  );
}
