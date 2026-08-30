"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const shown = images.length > 0 ? images : [""];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-line animate-iris">
        {shown[active] && (
          <Image src={shown[active]} alt={name} fill priority className="object-cover" />
        )}
      </div>
      {shown.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {shown.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-line border",
                active === i ? "border-ink" : "border-transparent"
              )}
            >
              {src && <Image src={src} alt={`${name} ${i + 1}`} fill className="object-cover" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
