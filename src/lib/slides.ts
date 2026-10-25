import type { HeroSize, Slide, SlideType } from "@/lib/types";

export const MIN_SLIDE_HEIGHT = 120;
export const MAX_SLIDE_HEIGHT = 1200;

// 0 = 내용에 맞춰 자동
export const SLIDE_HEIGHT_PRESETS = [
  { label: "자동", value: 0 },
  { label: "작게", value: 280 },
  { label: "보통", value: 380 },
  { label: "크게", value: 500 },
] as const;

// 예전 "가판대 크기(작게/보통/크게)" 값을 새 높이(px)로 옮길 때 사용
export const HERO_SIZE_HEIGHT: Record<HeroSize, number> = { sm: 280, md: 380, lg: 500 };

export const DEFAULT_TEXT_COLOR = "#0A0A0A";
export const DEFAULT_HERO_BG = "#3B3A38";

export function createSlideId(): string {
  return `s_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function clampSlideHeight(value: number): number {
  return Math.min(Math.max(Math.round(value), MIN_SLIDE_HEIGHT), MAX_SLIDE_HEIGHT);
}

// 새 슬라이드의 기본값. 글은 비워두고(에디터에서는 안내 문구가 보임), 눈에 띄는 기본 배경을 줍니다.
export function createSlide(type: SlideType): Slide {
  if (type === "products") {
    return {
      id: createSlideId(),
      type,
      title: "",
      body: "",
      bg: "",
      textColor: DEFAULT_TEXT_COLOR,
      height: 0,
    };
  }
  return {
    id: createSlideId(),
    type,
    title: "",
    body: "",
    bg: "#FFFFFF",
    textColor: DEFAULT_TEXT_COLOR,
    height: 320,
  };
}

export function slideTypeLabel(type: SlideType): string {
  return type === "products" ? "상품카드" : "텍스트";
}
