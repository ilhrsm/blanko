import { ProductGrid } from "@/components/product/ProductGrid";
import { EditableText } from "./EditableText";
import type { HeroSize, Product, SiteSettings } from "@/lib/types";

const HERO_PADDING: Record<HeroSize, string> = {
  sm: "py-14 md:py-20",
  md: "py-24 md:py-32",
  lg: "py-32 md:py-44",
};

interface ShopViewProps {
  settings: SiteSettings;
  products: Product[];
  loading?: boolean;
  // true면 히어로/소개 문구를 실제 화면 위에서 바로 편집할 수 있습니다. (관리자 "메인 페이지 관리"에서 사용)
  editable?: boolean;
  onHeroTitleChange?: (value: string) => void;
  onHeroDescriptionChange?: (value: string) => void;
  onAboutTitleChange?: (value: string) => void;
  onAboutBodyChange?: (value: string) => void;
}

export function ShopView({
  settings,
  products,
  loading,
  editable = false,
  onHeroTitleChange,
  onHeroDescriptionChange,
  onAboutTitleChange,
  onAboutBodyChange,
}: ShopViewProps) {
  const backgroundStyle = settings.bgImageUrl
    ? {
        backgroundImage: `url(${settings.bgImageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : { backgroundColor: settings.bgColor };

  const heroPadding = HERO_PADDING[settings.theme.heroSize] ?? HERO_PADDING.md;
  const showAbout = editable || settings.about.title || settings.about.body;

  return (
    <div style={backgroundStyle}>
      <section
        className={`flex flex-col items-center justify-center gap-6 bg-ink/80 px-5 text-center ${heroPadding}`}
      >
        <div className="w-full max-w-2xl">
          <EditableText
            editable={editable}
            value={settings.hero.title || settings.shopName}
            placeholder={settings.shopName}
            onChange={onHeroTitleChange}
            className="text-center font-display text-3xl font-bold text-ivory md:text-5xl"
          />
        </div>
        <div className="w-full max-w-md">
          <EditableText
            editable={editable}
            as="textarea"
            rows={2}
            value={settings.hero.description}
            placeholder="쇼핑몰을 소개하는 한 줄 문구를 적어보세요"
            onChange={onHeroDescriptionChange}
            className="text-center font-body text-sm text-ivory/80"
          />
        </div>
      </section>

      {showAbout && (
        <section className="mx-auto max-w-content px-5 py-14 md:px-8 md:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-3">
              <EditableText
                editable={editable}
                value={settings.about.title}
                placeholder="브랜드 소개"
                onChange={onAboutTitleChange}
                className="text-center font-display text-lg font-semibold text-ink"
              />
            </div>
            <EditableText
              editable={editable}
              as="textarea"
              rows={3}
              value={settings.about.body}
              placeholder="어떤 상점인지, 어떤 이야기를 담고 있는지 적어보세요"
              onChange={onAboutBodyChange}
              className="text-center font-body text-sm leading-relaxed text-muted"
            />
          </div>
        </section>
      )}

      <section className="mx-auto max-w-content px-5 py-14 md:px-8 md:py-20">
        <ProductGrid
          products={products}
          loading={loading}
          layout={settings.theme.cardLayout}
          ratio={settings.theme.cardRatio}
          accentColor={settings.theme.accentColor}
        />
      </section>
    </div>
  );
}
