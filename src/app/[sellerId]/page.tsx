import { notFound } from "next/navigation";
import { ShopView } from "@/components/shop/ShopView";
import { getVisibleProductsBySeller } from "@/lib/firebase/products";
import { getSellerSettings } from "@/lib/firebase/settings";
import { getUserDocument, getUidByStoreId } from "@/lib/firebase/users";

export const revalidate = 30;

interface SellerShopPageProps {
  params: { sellerId: string };
}

// URL의 [sellerId] 구간은 셀러가 직접 정한 "상점아이디"(예: /mystore)이거나,
// 상점아이디를 아직 만들지 않은 구글 로그인 셀러의 경우 uid 그대로일 수 있습니다.
// storeSlugs에서 먼저 매핑을 찾고, 없으면 uid로 취급합니다.
async function resolveSellerUid(sellerIdOrSlug: string): Promise<string | null> {
  const mappedUid = await getUidByStoreId(sellerIdOrSlug).catch(() => null);
  if (mappedUid) return mappedUid;
  const directUser = await getUserDocument(sellerIdOrSlug).catch(() => null);
  return directUser ? sellerIdOrSlug : null;
}

export async function generateMetadata({ params }: SellerShopPageProps) {
  const uid = await resolveSellerUid(params.sellerId);
  if (!uid) return { title: "Shipda" };
  const settings = await getSellerSettings(uid).catch(() => null);
  return { title: settings ? `${settings.shopName} | Shipda` : "Shipda" };
}

export default async function SellerShopPage({ params }: SellerShopPageProps) {
  const sellerId = await resolveSellerUid(params.sellerId);

  // 존재하지 않는 셀러(상점아이디/uid)면 404 처리
  if (!sellerId) notFound();

  const [settings, products] = await Promise.all([
    getSellerSettings(sellerId),
    getVisibleProductsBySeller(sellerId),
  ]);

  return <ShopView settings={settings} products={products} />;
}
