import Link from "next/link";
import Image from "next/image";
import type { CardRatio, Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

const RATIO_CLASS: Record<CardRatio, string> = {
  square: "aspect-square",
  portrait: "aspect-[4/5]",
  wide: "aspect-[3/2]",
};

interface ProductCardProps {
  product: Product;
  ratio?: CardRatio;
  accentColor?: string;
}

export function ProductCard({ product, ratio = "portrait", accentColor }: ProductCardProps) {
  const soldOut = product.stock <= 0;
  return (
    <Link href={`/product/${product.id}`} className="group block">
      <div className={`relative overflow-hidden rounded-md bg-line ${RATIO_CLASS[ratio]}`}>
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
      <div className="mt-4 space-y-1.5">
        <p className="font-body text-xs uppercase tracking-wide text-muted">{product.brand}</p>
        <p className="font-body text-sm text-ink">{product.name}</p>
        <p
          className="font-mono text-sm font-medium"
          style={accentColor ? { color: accentColor } : undefined}
        >
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
}
