"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import type { CardLayout, CardRatio, HeroSize, SiteSettings } from "@/lib/types";

type PanelKey = "color" | "hero" | "card" | null;

interface ShopEditorDockProps {
  settings: SiteSettings;
  onBgColorChange: (value: string) => void;
  onBgImageSelect: (file: File) => void;
  onBgImageRemove: () => void;
  bgUploading: boolean;
  onAccentColorChange: (value: string) => void;
  onHeroSizeChange: (value: HeroSize) => void;
  onCardLayoutChange: (value: CardLayout) => void;
  onCardRatioChange: (value: CardRatio) => void;
  onOpenStoreInfo: () => void;
  onSave: () => void;
  saving: boolean;
}

function DockButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "whitespace-nowrap rounded-full px-4 py-2.5 font-body text-sm transition-colors",
        active ? "bg-ink text-ivory" : "text-ink/70 hover:bg-ink/5"
      )}
    >
      {label}
    </button>
  );
}

function SegmentButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 rounded-lg border px-3 py-2 font-body text-xs transition-colors",
        active ? "border-ink bg-ink text-ivory" : "border-line bg-white text-ink/70 hover:border-ink/40"
      )}
    >
      {label}
    </button>
  );
}

export function ShopEditorDock({
  settings,
  onBgColorChange,
  onBgImageSelect,
  onBgImageRemove,
  bgUploading,
  onAccentColorChange,
  onHeroSizeChange,
  onCardLayoutChange,
  onCardRatioChange,
  onOpenStoreInfo,
  onSave,
  saving,
}: ShopEditorDockProps) {
  const [panel, setPanel] = useState<PanelKey>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function togglePanel(key: PanelKey) {
    setPanel((prev) => (prev === key ? null : key));
  }

  return (
    <div className="fixed inset-x-0 bottom-5 z-50 flex justify-center px-4">
      <div className="relative">
        {panel && (
          <div className="absolute bottom-full left-1/2 mb-3 w-[min(92vw,340px)] -translate-x-1/2 rounded-2xl border border-line bg-ivory p-5 shadow-xl">
            {panel === "color" && (
              <div className="space-y-5">
                <div>
                  <p className="mb-2 font-body text-xs font-medium text-ink">배경색</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.bgColor}
                      onChange={(e) => onBgColorChange(e.target.value)}
                      className="h-9 w-9 shrink-0 cursor-pointer rounded-md border border-line bg-transparent p-0.5"
                    />
                    <input
                      value={settings.bgColor}
                      onChange={(e) => onBgColorChange(e.target.value)}
                      className="flex-1 rounded-lg border border-line px-3 py-2 font-mono text-xs text-ink outline-none focus:border-ink"
                    />
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      disabled={bgUploading}
                      className="font-body text-xs text-ink underline underline-offset-2"
                    >
                      {bgUploading ? "업로드 중..." : "배경 이미지로 바꾸기"}
                    </button>
                    {settings.bgImageUrl && (
                      <button
                        type="button"
                        onClick={onBgImageRemove}
                        className="font-body text-xs text-muted underline underline-offset-2"
                      >
                        이미지 제거
                      </button>
                    )}
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && onBgImageSelect(e.target.files[0])}
                  />
                </div>

                <div>
                  <p className="mb-2 font-body text-xs font-medium text-ink">포인트 컬러</p>
                  <p className="mb-2 font-body text-[11px] text-muted">가격 등 강조 요소에 사용돼요.</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.theme.accentColor}
                      onChange={(e) => onAccentColorChange(e.target.value)}
                      className="h-9 w-9 shrink-0 cursor-pointer rounded-md border border-line bg-transparent p-0.5"
                    />
                    <input
                      value={settings.theme.accentColor}
                      onChange={(e) => onAccentColorChange(e.target.value)}
                      className="flex-1 rounded-lg border border-line px-3 py-2 font-mono text-xs text-ink outline-none focus:border-ink"
                    />
                  </div>
                </div>
              </div>
            )}

            {panel === "hero" && (
              <div>
                <p className="mb-3 font-body text-xs font-medium text-ink">가판대 크기</p>
                <div className="flex gap-2">
                  <SegmentButton
                    label="작게"
                    active={settings.theme.heroSize === "sm"}
                    onClick={() => onHeroSizeChange("sm")}
                  />
                  <SegmentButton
                    label="보통"
                    active={settings.theme.heroSize === "md"}
                    onClick={() => onHeroSizeChange("md")}
                  />
                  <SegmentButton
                    label="크게"
                    active={settings.theme.heroSize === "lg"}
                    onClick={() => onHeroSizeChange("lg")}
                  />
                </div>
              </div>
            )}

            {panel === "card" && (
              <div className="space-y-5">
                <div>
                  <p className="mb-3 font-body text-xs font-medium text-ink">한 줄에 보이는 개수</p>
                  <div className="flex gap-2">
                    <SegmentButton
                      label="2개"
                      active={settings.theme.cardLayout === "wide"}
                      onClick={() => onCardLayoutChange("wide")}
                    />
                    <SegmentButton
                      label="3개"
                      active={settings.theme.cardLayout === "cozy"}
                      onClick={() => onCardLayoutChange("cozy")}
                    />
                    <SegmentButton
                      label="4개"
                      active={settings.theme.cardLayout === "compact"}
                      onClick={() => onCardLayoutChange("compact")}
                    />
                  </div>
                </div>
                <div>
                  <p className="mb-3 font-body text-xs font-medium text-ink">카드 비율</p>
                  <div className="flex gap-2">
                    <SegmentButton
                      label="정사각형"
                      active={settings.theme.cardRatio === "square"}
                      onClick={() => onCardRatioChange("square")}
                    />
                    <SegmentButton
                      label="세로형"
                      active={settings.theme.cardRatio === "portrait"}
                      onClick={() => onCardRatioChange("portrait")}
                    />
                    <SegmentButton
                      label="가로형"
                      active={settings.theme.cardRatio === "wide"}
                      onClick={() => onCardRatioChange("wide")}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-1 rounded-full border border-line bg-ivory/95 p-1.5 shadow-lg backdrop-blur">
          <DockButton label="색상" active={panel === "color"} onClick={() => togglePanel("color")} />
          <DockButton label="가판대 크기" active={panel === "hero"} onClick={() => togglePanel("hero")} />
          <DockButton label="상품카드" active={panel === "card"} onClick={() => togglePanel("card")} />
          <span className="mx-1 h-5 w-px bg-line" />
          <DockButton label="상점 정보" onClick={onOpenStoreInfo} />
          <Button onClick={onSave} disabled={saving} className="ml-1 !px-5 !py-2.5">
            {saving ? "저장 중..." : "저장"}
          </Button>
        </div>
      </div>
    </div>
  );
}
