import Link from "next/link";

export const metadata = { title: "Shop | SmallCam" };

// 멀티테넌트 구조에서는 "전체 통합 쇼핑몰" 대신
// 셀러별 쇼핑몰(/[sellerId])만 존재합니다.
export default function ShopPage() {
  return (
    <div className="mx-auto flex max-w-content flex-col items-center gap-4 px-5 py-24 text-center">
      <h1 className="font-display text-2xl text-ink">셀러별 쇼핑몰</h1>
      <p className="font-body text-sm text-muted">
        SmallCam은 셀러마다 고유한 쇼핑몰 주소를 가집니다. 예: /abc123 (셀러 고유 주소)
      </p>
      <Link href="/login" className="rounded-full bg-ink px-6 py-3 font-body text-sm text-ivory">
        구글로 로그인하고 내 쇼핑몰 만들기
      </Link>
    </div>
  );
}
