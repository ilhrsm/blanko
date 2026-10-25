import type { MouseEvent } from "react";
import { ProductGrid } from "@/components/product/ProductGrid";
import { cn } from "@/lib/utils";
import { EditableText } from "./EditableText";
import { SlideResizeHandle } from "./SlideResizeHandle";
import type { Product, SiteSettings, Slide } from "@/lib/types";

export interface SlideSelectOptions {
  // 슬라이드의 빈 곳(배경)을 눌렀을 때 true. 글을 쓰려고 입력칸을 누른 경우는 false.
  fromBackground?: boolean;
}

interface ShopViewProps {
  settings: SiteSettings;
  products: Product[];
  loading?: boolean;
  // true면 슬라이드 글을 실제 화면 위에서 바로 편집하고, 슬라이드를 눌러 선택/높이 조절할 수 있습니다. ("가판대 편집"에서 사용)
  editable?: boolean;
  selectedSlideId?: string | null;
  onSelectSlide?: (id: string, options?: SlideSelectOptions) => void;
  onSlideChange?: (id: string, patch: Partial<Slide>) => void;
}

export function ShopView({
  settings,
  products,
  loading,
  editable = false,
  selectedSlideId = null,
  onSelectSlide,
  onSlideChange,
}: ShopViewProps) {
  const backgroundStyle = settings.bgImageUrl
    ? {
        backgroundImage: `url(${settings.bgImageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : { backgroundColor: settings.bgColor };

  // 실제 화면에서는 글이 하나도 없는 텍스트 슬라이드를 숨깁니다. (편집 중에는 항상 보임)
  const slides = settings.slides.filter(
    (slide) => editable || slide.type === "products" || slide.title || slide.body
  );

  return (
    <div style={backgroundStyle}>
      {slides.map((slide, index) => {
        const selected = editable && selectedSlideId === slide.id;
        const isFirst = index === 0;

        // 편집 중 슬라이드 클릭 → 선택. 상품카드 링크는 편집 화면에서 이동하지 않도록 막습니다.
        function handleClickCapture(e: MouseEvent<HTMLElement>) {
          const target = e.target as HTMLElement;
          if (target.closest("a")) e.preventDefault();
          onSelectSlide?.(slide.id, { fromBackground: !target.closest("input, textarea") });
        }

        return (
          <section
            key={slide.id}
            id={`slide-${slide.id}`}
            onClickCapture={editable ? handleClickCapture : undefined}
            onFocusCapture={editable ? () => onSelectSlide?.(slide.id) : undefined}
            style={{
              background: slide.bg || undefined,
              color: slide.textColor,
              minHeight: slide.height > 0 ? slide.height : undefined,
            }}
            className={cn(
              "group/slide relative flex flex-col items-center justify-center px-5 py-12 text-center md:px-8 md:py-16",
              editable &&
                "transition-shadow hover:shadow-[inset_0_0_0_2px_rgba(99,102,241,0.35)]",
              selected && "!shadow-[inset_0_0_0_2px_rgb(99,102,241)]"
            )}
          >
            {slide.type === "products" ? (
              <div data-slide-content className="w-full max-w-content">
                {(editable || slide.title) && (
                  <div className="mx-auto mb-8 max-w-2xl">
                    <EditableText
                      editable={editable}
                      value={slide.title}
                      placeholder="섹션 제목 (선택)"
                      onChange={(v) => onSlideChange?.(slide.id, { title: v })}
                      className="block text-center font-display text-2xl font-bold md:text-3xl"
                    />
                  </div>
                )}
                <ProductGrid
                  products={products}
                  loading={loading}
                  layout={settings.theme.cardLayout}
                  ratio={settings.theme.cardRatio}
                  accentColor={settings.theme.accentColor}
                  textColor={slide.textColor}
                />
              </div>
            ) : (
              <div data-slide-content className="w-full max-w-2xl space-y-4">
                <div className="w-full">
                  <EditableText
                    editable={editable}
                    value={slide.title}
                    placeholder="제목을 입력하세요"
                    onChange={(v) => onSlideChange?.(slide.id, { title: v })}
                    className={cn(
                      "block text-center font-display font-bold",
                      isFirst ? "text-3xl md:text-5xl" : "text-2xl md:text-4xl"
                    )}
                  />
                </div>
                <div className="mx-auto w-full max-w-md">
                  <EditableText
                    editable={editable}
                    as="textarea"
                    rows={3}
                    value={slide.body}
                    placeholder="내용을 입력하세요"
                    onChange={(v) => onSlideChange?.(slide.id, { body: v })}
                    className="block whitespace-pre-line text-center font-body text-sm leading-relaxed opacity-80"
                  />
                </div>
              </div>
            )}

            {editable && (
              <SlideResizeHandle
                selected={selected}
                height={slide.height}
                onStart={() => onSelectSlide?.(slide.id)}
                onResize={(h) => onSlideChange?.(slide.id, { height: h })}
              />
            )}
          </section>
        );
      })}
    </div>
  );
}
