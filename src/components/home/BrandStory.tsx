import { Aperture } from "@/components/ui/Aperture";

export function BrandStory() {
  return (
    <section className="bg-ink">
      <div className="mx-auto flex max-w-content flex-col items-center gap-6 px-5 py-20 text-center md:px-8 md:py-28">
        <Aperture size={36} className="text-ivory/50" />
        <p className="max-w-xl font-display text-2xl leading-relaxed text-ivory md:text-3xl">
          SmallCam은 정직한 소재와 정밀한 손끝으로 완성한 카메라를 통해,
          사진을 찍는 순간의 감각을 되살립니다.
        </p>
        <p className="max-w-md font-body text-sm text-ivory/60">
          모든 제품은 실사용을 기준으로 검수하며, 오래도록 곁에 둘 수 있는 물건만을 소개합니다.
        </p>
      </div>
    </section>
  );
}
