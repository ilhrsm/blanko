import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/product/ProductGrid";
import { getVisibleProductsBySeller } from "@/lib/firebase/products";
import { getSellerSettings } from "@/lib/firebase/settings";
import { getUserDocument } from "@/lib/firebase/users";

export const revalidate = 30;

interface SellerShopPageProps {
  params: { sellerId: string };
}

export async function generateMetadata({ params }: SellerShopPageProps) {
  const settings = await getSellerSettings(params.sellerId).catch(() => null);
  return { title: settings ? `${settings.shopName} | SmallCam` : "SmallCam" };
}

export default async function SellerShopPage({ params }: SellerShopPageProps) {
  const { sellerId } = params;

  // 존재하지 않는 셀러(uid)면 404 처리
  const sellerUser = await getUserDocument(sellerId).catch(() => null);
  if (!sellerUser) notFound();

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
        <p className="font-display text-3xl tracking-tight text-ivory md:text-5xl">
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
