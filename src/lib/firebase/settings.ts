import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./client";
import type { SiteSettings } from "@/lib/types";

const COLLECTION = "settings";

export function defaultSettings(shopName = "나의 쇼핑몰"): SiteSettings {
  return {
    shopName,
    bgColor: "#F5F1EA",
    bgImageUrl: "",
    hero: {
      imageUrl: "",
      title: shopName,
      description: "이 쇼핑몰만의 이야기를 소개해보세요.",
    },
    featuredProductIds: [],
    about: {
      title: "브랜드 소개",
      body: "",
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

// 특정 셀러의 쇼핑몰 설정 조회 (없으면 기본값 반환)
export async function getSellerSettings(sellerId: string): Promise<SiteSettings> {
  const ref = doc(db, COLLECTION, sellerId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return defaultSettings();
  const data = snap.data() as Partial<SiteSettings>;
  return { ...defaultSettings(), ...data };
}

// 본인 쇼핑몰 설정 저장 (merge)
export async function updateSellerSettings(sellerId: string, input: Partial<SiteSettings>) {
  const ref = doc(db, COLLECTION, sellerId);
  await setDoc(ref, input, { merge: true });
}
