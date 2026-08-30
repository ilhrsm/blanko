import { Aperture } from "@/components/ui/Aperture";
import { defaultSettings } from "@/lib/firebase/settings";

export const metadata = { title: "About | Shipda" };
export const revalidate = 60;

// 플랫폼 공통 소개 페이지입니다. 셀러별 소개는 app/[sellerId]에서 다루세요.
export default async function AboutPage() {
  const about = defaultSettings().about;
  const paragraphs = (about?.body ?? "").split(/\n\s*\n/).filter((p) => p.trim());

  return (
    <div className="mx-auto max-w-3xl px-5 py-16 md:px-8 md:py-24">
      <Aperture size={32} className="text-ink/40" />
      <h1 className="mt-6 font-display text-3xl text-ink md:text-4xl">{about?.title || "브랜드 소개"}</h1>
      <div className="mt-8 flex flex-col gap-6 font-body text-base leading-relaxed text-ink/80">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>
  );
}
