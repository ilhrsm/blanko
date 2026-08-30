import Link from "next/link";
import { Aperture } from "@/components/ui/Aperture";

// 이 Footer는 플랫폼 전체(모든 셀러 페이지)에 공통으로 노출되므로
// 특정 셀러의 사업자 정보(business)는 더 이상 여기서 보여주지 않습니다.
// 셀러별 사업자 정보를 보여주고 싶다면 app/[sellerId]/page.tsx 안에서
// getSellerSettings(sellerId)로 불러와 별도 Footer를 렌더링하세요.
export async function Footer() {
  return (
    <footer className="border-t border-line/70 bg-ivory">
      <div className="mx-auto max-w-content px-5 py-14 md:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-xs">
            <div className="flex items-center gap-2">
              <Aperture size={20} className="text-ink/60" />
              <span className="font-display text-lg text-ink">SHIPDA</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 font-body text-sm text-ink/70 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <span className="mb-1 text-xs uppercase tracking-widest text-muted">Shop</span>
              <Link href="/shop">전체 상품</Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="mb-1 text-xs uppercase tracking-widest text-muted">Company</span>
              <Link href="/about">브랜드 소개</Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="mb-1 text-xs uppercase tracking-widest text-muted">My</span>
              <Link href="/mypage">마이페이지</Link>
              <Link href="/cart">장바구니</Link>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-line/70 pt-6 font-body text-xs text-muted md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} Shipda. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
