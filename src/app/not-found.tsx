import Link from "next/link";
import { Aperture } from "@/components/ui/Aperture";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <Aperture size={40} className="text-ink/20" />
      <p className="font-display text-2xl text-ink">페이지를 찾을 수 없습니다</p>
      <p className="font-body text-sm text-muted">주소가 정확한지 확인해주세요.</p>
      <Link href="/">
        <Button variant="secondary">홈으로 돌아가기</Button>
      </Link>
    </div>
  );
}
