"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { CustomColor, Swatch, SwatchGrid } from "@/components/admin/ColorPicker";
import { ACCENT_COLORS, GRADIENTS, PAGE_BG_COLORS, SOLID_COLORS, TEXT_COLORS } from "@/lib/palette";
import {
  MIN_SLIDE_HEIGHT,
  SLIDE_HEIGHT_PRESETS,
  slideTypeLabel,
} from "@/lib/slides";
import type { CardLayout, CardRatio, SiteSettings, Slide, SlideType } from "@/lib/types";

// 슬라이더는 쓰기 편하도록 900px까지만, 그 이상은 화면에서 끌어서 조절합니다.
const SLIDER_MAX = 900;

export type DockPanel = "color" | "slides" | "card" | null;

interface ShopEditorDockProps {
  settings: SiteSettings;
  panel: DockPanel;
  onPanelChange: (panel: DockPanel) => void;
  selectedSlideId: string | null;
  onSelectSlide: (id: string) => void;
  onSlideChange: (id: string, patch: Partial<Slide>) => void;
  onAddSlide: (type: SlideType) => void;
  onRemoveSlide: (id: string) => void;
  onMoveSlide: (id: string, direction: -1 | 1) => void;
  onBgColorChange: (value: string) => void;
  onBgImageSelect: (file: File) => void;
  onBgImageRemove: () => void;
  bgUploading: boolean;
  onAccentColorChange: (value: string) => void;
  onCardLayoutChange: (value: CardLayout) => void;
  onCardRatioChange: (value: CardRatio) => void;
  onOpenStoreInfo: () => void;
  onSave: () => void;
  saving: boolean;
}

/* ───────── 아이콘 (아주 작은 인라인 SVG) ───────── */

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="hidden shrink-0 sm:block"
    >
      {children}
    </svg>
  );
}

const IconColor = () => (
  <Icon>
    <path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.8-.8 1.8-1.7 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-.9.8-1.7 1.7-1.7H16a5 5 0 0 0 5-5c0-3.9-4-7.2-9-7.2Z" />
    <circle cx="7.5" cy="11" r="1" />
    <circle cx="10.5" cy="7" r="1" />
    <circle cx="15" cy="7.5" r="1" />
  </Icon>
);
const IconSlides = () => (
  <Icon>
    <rect x="3" y="4" width="18" height="6" rx="1.5" />
    <rect x="3" y="14" width="18" height="6" rx="1.5" />
  </Icon>
);
const IconCards = () => (
  <Icon>
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
  </Icon>
);
const IconStore = () => (
  <Icon>
    <path d="M4 9.5 5.5 4h13L20 9.5" />
    <path d="M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0" />
    <path d="M5.5 12.5V20h13v-7.5" />
  </Icon>
);

/* ───────── 공통 작은 UI ───────── */

function DockButton({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon?: ReactNode;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2.5 font-body text-sm transition-colors sm:px-4",
        active ? "bg-ink text-ivory" : "text-ink/70 hover:bg-ink/5"
      )}
    >
      {icon}
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

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2.5">
      <div>
        <p className="font-body text-xs font-semibold text-ink">{title}</p>
        {hint && <p className="mt-0.5 font-body text-[11px] text-muted">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function PanelHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <p className="font-body text-sm font-semibold text-ink">{title}</p>
      <button
        type="button"
        onClick={onClose}
        aria-label="닫기"
        className="flex h-7 w-7 items-center justify-center rounded-full text-ink/50 transition-colors hover:bg-ink/5 hover:text-ink"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
    </div>
  );
}

// 슬라이드 번호 칩. 칩 안의 작은 동그라미가 그 슬라이드의 배경색이라 한눈에 구분됩니다.
function SlidePicker({
  slides,
  selectedId,
  onSelect,
}: {
  slides: Slide[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
      {slides.map((slide, index) => {
        const active = slide.id === selectedId;
        return (
          <button
            key={slide.id}
            type="button"
            onClick={() => onSelect(slide.id)}
            title={`슬라이드 ${index + 1} · ${slideTypeLabel(slide.type)}`}
            className={cn(
              "flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 font-body text-xs font-medium transition-colors",
              active
                ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                : "border-line bg-white text-ink/70 hover:border-ink/30"
            )}
          >
            <span
              className="h-3.5 w-3.5 rounded-full border border-black/15"
              style={{ background: slide.bg || "#ffffff" }}
            />
            {index + 1}
          </button>
        );
      })}
    </div>
  );
}

/* ───────── 도크 본체 ───────── */

export function ShopEditorDock({
  settings,
  panel,
  onPanelChange,
  selectedSlideId,
  onSelectSlide,
  onSlideChange,
  onAddSlide,
  onRemoveSlide,
  onMoveSlide,
  onBgColorChange,
  onBgImageSelect,
  onBgImageRemove,
  bgUploading,
  onAccentColorChange,
  onCardLayoutChange,
  onCardRatioChange,
  onOpenStoreInfo,
  onSave,
  saving,
}: ShopEditorDockProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [showPageColors, setShowPageColors] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const slides = settings.slides;
  const selectedIndex = Math.max(
    0,
    slides.findIndex((s) => s.id === selectedSlideId)
  );
  const slide: Slide | undefined = slides[selectedIndex];

  // 다른 슬라이드로 옮기면 삭제 확인 상태를 초기화합니다.
  useEffect(() => {
    setConfirmDelete(false);
  }, [slide?.id]);

  // 한 번 눌러 "정말 삭제" 상태가 되면 3초 뒤에 자동으로 취소됩니다.
  useEffect(() => {
    if (!confirmDelete) return;
    const timer = setTimeout(() => setConfirmDelete(false), 3000);
    return () => clearTimeout(timer);
  }, [confirmDelete]);

  // Esc로 패널 닫기
  useEffect(() => {
    if (!panel) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onPanelChange(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [panel, onPanelChange]);

  function togglePanel(key: Exclude<DockPanel, null>) {
    onPanelChange(panel === key ? null : key);
    // 슬라이드를 아직 고르지 않았다면 첫 슬라이드를 대상으로 잡아줍니다.
    if (!selectedSlideId && slides[0]) onSelectSlide(slides[0].id);
  }

  const panelClass =
    "absolute bottom-full left-1/2 mb-3 max-h-[min(72vh,600px)] w-[min(92vw,360px)] -translate-x-1/2 overflow-y-auto overscroll-contain rounded-2xl border border-line bg-white p-4 shadow-2xl";

  return (
    <div className="fixed inset-x-0 bottom-5 z-50 flex justify-center px-4">
      <div className="relative">
        {panel === "color" && slide && (
          <div className={panelClass}>
            <PanelHeader title="색상" onClose={() => onPanelChange(null)} />

            <div className="space-y-5">
              <Section title="편집할 슬라이드">
                <SlidePicker slides={slides} selectedId={slide.id} onSelect={onSelectSlide} />
              </Section>

              <Section title="슬라이드 배경">
                <button
                  type="button"
                  onClick={() => onSlideChange(slide.id, { bg: "" })}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left font-body text-xs transition-colors",
                    slide.bg === ""
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-line text-ink/70 hover:border-ink/30"
                  )}
                >
                  <span
                    className="relative h-4 w-4 overflow-hidden rounded-full border border-black/15 bg-white"
                    aria-hidden
                  >
                    <span className="absolute left-1/2 top-[-2px] h-[22px] w-px origin-center rotate-45 bg-red-400" />
                  </span>
                  배경 없음 · 페이지 배경 그대로
                </button>
                <SwatchGrid
                  colors={SOLID_COLORS}
                  value={slide.bg}
                  onPick={(c) => onSlideChange(slide.id, { bg: c })}
                />
                <p className="pt-1 font-body text-[11px] text-muted">그라데이션</p>
                <SwatchGrid
                  colors={GRADIENTS}
                  value={slide.bg}
                  onPick={(c) => onSlideChange(slide.id, { bg: c })}
                />
                <CustomColor value={slide.bg} onChange={(c) => onSlideChange(slide.id, { bg: c })} />
              </Section>

              <Section title="글씨 색" hint="제목·내용·상품 이름에 적용돼요.">
                <SwatchGrid
                  colors={TEXT_COLORS}
                  value={slide.textColor}
                  onPick={(c) => onSlideChange(slide.id, { textColor: c })}
                />
                <CustomColor
                  value={slide.textColor}
                  onChange={(c) => onSlideChange(slide.id, { textColor: c })}
                />
              </Section>

              <div className="border-t border-line pt-4">
                <button
                  type="button"
                  onClick={() => setShowPageColors((v) => !v)}
                  aria-expanded={showPageColors}
                  className="flex w-full items-center justify-between font-body text-xs font-semibold text-ink"
                >
                  페이지 전체 색
                  <span className={cn("text-ink/40 transition-transform", showPageColors && "rotate-180")}>
                    ▾
                  </span>
                </button>

                {showPageColors && (
                  <div className="mt-4 space-y-5">
                    <Section title="페이지 배경" hint="'배경 없음'으로 둔 슬라이드 뒤에 보여요.">
                      <SwatchGrid
                        colors={PAGE_BG_COLORS}
                        value={settings.bgColor}
                        onPick={onBgColorChange}
                      />
                      <CustomColor value={settings.bgColor} onChange={onBgColorChange} />
                      <div className="flex gap-3">
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
                    </Section>

                    <Section title="포인트 컬러" hint="가격 등 강조 요소에 사용돼요.">
                      <SwatchGrid
                        colors={ACCENT_COLORS}
                        value={settings.theme.accentColor}
                        onPick={onAccentColorChange}
                      />
                      <CustomColor value={settings.theme.accentColor} onChange={onAccentColorChange} />
                    </Section>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {panel === "slides" && slide && (
          <div className={panelClass}>
            <PanelHeader title="가판대 크기" onClose={() => onPanelChange(null)} />

            <div className="space-y-5">
              <Section title="슬라이드" hint="번호를 눌러 고르거나, 화면에서 슬라이드를 직접 눌러도 돼요.">
                <SlidePicker slides={slides} selectedId={slide.id} onSelect={onSelectSlide} />
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onAddSlide("text")}
                    className="rounded-lg border border-dashed border-ink/25 px-3 py-2.5 font-body text-xs text-ink transition-colors hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-700"
                  >
                    + 글 슬라이드
                  </button>
                  <button
                    type="button"
                    onClick={() => onAddSlide("products")}
                    className="rounded-lg border border-dashed border-ink/25 px-3 py-2.5 font-body text-xs text-ink transition-colors hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-700"
                  >
                    + 상품카드 슬라이드
                  </button>
                </div>
              </Section>

              <Section title={`슬라이드 ${selectedIndex + 1} · ${slideTypeLabel(slide.type)}`}>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    disabled={selectedIndex === 0}
                    onClick={() => onMoveSlide(slide.id, -1)}
                    className="rounded-lg border border-line bg-white px-2 py-2 font-body text-xs text-ink/70 transition-colors hover:border-ink/30 disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    ↑ 위로
                  </button>
                  <button
                    type="button"
                    disabled={selectedIndex === slides.length - 1}
                    onClick={() => onMoveSlide(slide.id, 1)}
                    className="rounded-lg border border-line bg-white px-2 py-2 font-body text-xs text-ink/70 transition-colors hover:border-ink/30 disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    ↓ 아래로
                  </button>
                  <button
                    type="button"
                    disabled={slides.length <= 1}
                    onClick={() => (confirmDelete ? onRemoveSlide(slide.id) : setConfirmDelete(true))}
                    className={cn(
                      "rounded-lg border px-2 py-2 font-body text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-35",
                      confirmDelete
                        ? "border-red-600 bg-red-600 text-white"
                        : "border-line bg-white text-red-600 hover:border-red-300"
                    )}
                  >
                    {confirmDelete ? "정말 삭제" : "삭제"}
                  </button>
                </div>
              </Section>

              <Section
                title="높이"
                hint="슬라이드 아래쪽 경계선을 마우스로 위아래로 끌어도 조절돼요."
              >
                <div className="flex gap-2">
                  {SLIDE_HEIGHT_PRESETS.map((preset) => (
                    <SegmentButton
                      key={preset.label}
                      label={preset.label}
                      active={slide.height === preset.value}
                      onClick={() => onSlideChange(slide.id, { height: preset.value })}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={MIN_SLIDE_HEIGHT}
                    max={SLIDER_MAX}
                    step={10}
                    value={Math.min(slide.height || 380, SLIDER_MAX)}
                    onChange={(e) => onSlideChange(slide.id, { height: Number(e.target.value) })}
                    aria-label="슬라이드 높이"
                    className="h-1.5 flex-1 cursor-pointer accent-indigo-500"
                  />
                  <span className="w-14 shrink-0 text-right font-mono text-xs text-ink/70">
                    {slide.height > 0 ? `${slide.height}px` : "자동"}
                  </span>
                </div>
              </Section>
            </div>
          </div>
        )}

        {panel === "card" && (
          <div className={panelClass}>
            <PanelHeader title="상품카드" onClose={() => onPanelChange(null)} />
            <div className="space-y-5">
              <Section title="한 줄에 보이는 개수">
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
              </Section>
              <Section title="카드 비율">
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
              </Section>
            </div>
          </div>
        )}

        <div className="flex items-center gap-1 rounded-full border border-line bg-white/95 p-1.5 shadow-lg backdrop-blur">
          <DockButton
            label="색상"
            icon={<IconColor />}
            active={panel === "color"}
            onClick={() => togglePanel("color")}
          />
          <DockButton
            label="가판대 크기"
            icon={<IconSlides />}
            active={panel === "slides"}
            onClick={() => togglePanel("slides")}
          />
          <DockButton
            label="상품카드"
            icon={<IconCards />}
            active={panel === "card"}
            onClick={() => togglePanel("card")}
          />
          <span className="mx-1 h-5 w-px bg-line" />
          <DockButton label="상점 정보" icon={<IconStore />} onClick={onOpenStoreInfo} />
          <Button onClick={onSave} disabled={saving} className="ml-1 !px-5 !py-2.5">
            {saving ? "저장 중..." : "저장"}
          </Button>
        </div>
      </div>
    </div>
  );
}
