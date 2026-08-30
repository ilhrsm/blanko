import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/product/ProductGrid";
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

  const backgroundStyle = settings.bgImageUrl
    ? {
        backgroundImage: `url(${settings.bgImageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : { backgroundColor: settings.bgColor };

  return (
    <div style={backgroundStyle}>
      <section className="flex flex-col items-center justify-center gap-6 bg-ink/80 px-5 py-24 text-center md:py-32">
        <p className="font-display text-3xl text-ivory md:text-5xl">
          {settings.hero.title || settings.shopName}
        </p>
        {settings.hero.description && (
          <p className="max-w-md font-body text-sm text-ivory/80">{settings.hero.description}</p>
        )}
      </section>

      <section className="mx-auto max-w-content px-5 py-14 md:px-8 md:py-20">
        <ProductGrid products={products} />
      </section>
    </div>
  );
}
