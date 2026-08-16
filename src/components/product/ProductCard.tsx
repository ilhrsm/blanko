import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const soldOut = product.stock <= 0;
  return (
    <Link href={`/product/${product.id}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-line">
        {product.coverImage && (
          <Image
            src={product.coverImage}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        )}
        {soldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/40">
            <span className="rounded-full bg-ivory px-3 py-1 font-body text-xs text-ink">
              품절
            </span>
          </div>
        )}
      </div>
      <div className="mt-3 space-y-0.5">
        <p className="font-body text-xs uppercase tracking-wide text-muted">{product.brand}</p>
        <p className="font-body text-sm text-ink">{product.name}</p>
        <p className="font-mono text-sm text-ink">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}
