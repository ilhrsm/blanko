import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./client";
import {
  DEFAULT_HERO_BG,
  DEFAULT_TEXT_COLOR,
  HERO_SIZE_HEIGHT,
  clampSlideHeight,
  createSlideId,
} from "@/lib/slides";
import type { SiteSettings, Slide } from "@/lib/types";

const COLLECTION = "settings";

// 기본 슬라이드 3장: 상단 배너(나의 쇼핑몰) / 브랜드 소개 / 상품카드
function buildSlides(opts: {
  heroTitle: string;
  heroDescription: string;
  aboutTitle: string;
  aboutBody: string;
  heroHeight: number;
}): Slide[] {
  return [
    {
      id: "hero",
      type: "text",
      title: opts.heroTitle,
      body: opts.heroDescription,
      bg: DEFAULT_HERO_BG,
      textColor: "#FFFFFF",
      height: opts.heroHeight,
    },
    {
      id: "about",
      type: "text",
      title: opts.aboutTitle,
      body: opts.aboutBody,
      bg: "",
      textColor: DEFAULT_TEXT_COLOR,
      height: 0,
    },
    {
      id: "products",
      type: "products",
      title: "",
      body: "",
      bg: "",
      textColor: DEFAULT_TEXT_COLOR,
      height: 0,
    },
  ];
}

export function defaultSettings(shopName = "나의 쇼핑몰"): SiteSettings {
  const description = "이 쇼핑몰만의 이야기를 소개해보세요.";
  return {
    shopName,
    bgColor: "#F5F1EA",
    bgImageUrl: "",
    hero: {
      imageUrl: "",
      title: shopName,
      description,
    },
    featuredProductIds: [],
    about: {
      title: "브랜드 소개",
      body: "",
    },
    slides: buildSlides({
      heroTitle: shopName,
      heroDescription: description,
      aboutTitle: "브랜드 소개",
      aboutBody: "",
      heroHeight: HERO_SIZE_HEIGHT.md,
    }),
    theme: {
      accentColor: "#0A0A0A",
      heroSize: "md",
      cardLayout: "cozy",
      cardRatio: "portrait",
    },
    bankInfo: {
      bankName: "",
      accountNumber: "",
      accountHolder: "",
    },
    business: {
      companyName: "",
      ceoName: "",
      bizRegNumber: "",
    },
  };
}

// 저장된 slides 배열을 안전하게 정리합니다. (필드 누락/잘못된 타입 방어)
// 배열이 아니거나 비어있으면 null을 돌려줘서 호출 쪽에서 기본값/구버전 데이터로 대체하게 합니다.
function normalizeSlides(raw: unknown): Slide[] | null {
  if (!Array.isArray(raw)) return null;
  const list: Slide[] = raw
    .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
    .map((item) => ({
      id: typeof item.id === "string" && item.id ? item.id : createSlideId(),
      type: item.type === "products" ? "products" : "text",
      title: typeof item.title === "string" ? item.title : "",
      body: typeof item.body === "string" ? item.body : "",
      bg: typeof item.bg === "string" ? item.bg : "",
      textColor:
        typeof item.textColor === "string" && item.textColor ? item.textColor : DEFAULT_TEXT_COLOR,
      height:
        typeof item.height === "number" && Number.isFinite(item.height) && item.height > 0
          ? clampSlideHeight(item.height)
          : 0,
    }));
  return list.length > 0 ? list : null;
}

// 특정 셀러의 쇼핑몰 설정 조회 (없으면 기본값 반환)
export async function getSellerSettings(sellerId: string): Promise<SiteSettings> {
  const ref = doc(db, COLLECTION, sellerId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return defaultSettings();
  const data = snap.data() as Partial<SiteSettings>;
  const base = defaultSettings();
  const theme = { ...base.theme, ...(data.theme ?? {}) };

  // slides가 아직 없는 예전 데이터는 기존 hero/about/heroSize 값을 슬라이드로 옮겨서 그대로 보이게 합니다.
  const hero = { ...base.hero, ...(data.hero ?? {}) };
  const about = { ...base.about, ...(data.about ?? {}) };
  const slides =
    normalizeSlides(data.slides) ??
    buildSlides({
      heroTitle: hero.title || data.shopName || base.shopName,
      heroDescription: hero.description,
      aboutTitle: about.title,
      aboutBody: about.body,
      heroHeight: HERO_SIZE_HEIGHT[theme.heroSize] ?? HERO_SIZE_HEIGHT.md,
    });

  // theme은 나중에 필드가 추가될 수 있어 얕은 병합이 아니라 기본값과 한 번 더 합칩니다.
  return { ...base, ...data, hero, about, slides, theme };
}

// 본인 쇼핑몰 설정 저장 (merge)
export async function updateSellerSettings(sellerId: string, input: Partial<SiteSettings>) {
  const ref = doc(db, COLLECTION, sellerId);
  await setDoc(ref, input, { merge: true });
}
