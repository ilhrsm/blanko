import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import type { HeroSettings } from "@/lib/types";

export function Hero({ hero }: { hero: HeroSettings }) {
  return (
    <section className="relative overflow-hidden bg-ink">
      <div className="relative aspect-[4/5] w-full md:aspect-[16/7]">
        {hero.imageUrl ? (
          <Image src={hero.imageUrl} alt={hero.title} fill priority className="object-cover opacity-80" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-ink to-[#2b241d]" />
        )}
        <div className="absolute inset-0 flex flex-col items-start justify-end gap-5 px-6 pb-14 md:px-16 md:pb-20">
          <p className="font-mono text-xs tracking-[0.3em] text-ivory/60">SINCE THE FIRST SHUTTER</p>
          <h1 className="max-w-lg font-display text-4xl leading-tight text-ivory md:text-6xl">
            {hero.title}
          </h1>
          <p className="max-w-sm font-body text-sm text-ivory/70 md:text-base">{hero.description}</p>
          <Link href="/shop">
            <Button className="bg-ivory text-ink hover:bg-ivory/90">컬렉션 둘러보기</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
