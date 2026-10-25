import { uploadToCloudinary } from "@/lib/cloudinary";

// 이미지 업로드는 Firebase Storage 대신 Cloudinary를 사용합니다.
// (카드 등록/Blaze 요금제 없이 무료로 바로 사용 가능)
// 함수 시그니처는 기존과 동일하게 유지해서 다른 코드는 손댈 필요 없습니다.

export async function uploadProductImage(
  file: File,
  sellerId: string,
  productId: string
): Promise<string> {
  return uploadToCloudinary(file, `products/${sellerId}/${productId}`);
}

// 셀러 쇼핑몰의 배경 이미지 / 히어로 이미지 업로드
export async function uploadSellerImage(file: File, sellerId: string): Promise<string> {
  return uploadToCloudinary(file, `sellers/${sellerId}`);
}

// 참고: Cloudinary에서 이미지를 삭제하려면 API secret이 필요한 서버 사이드
// 서명(signature) 요청이 있어야 합니다. 지금은 삭제 기능 없이 업로드만 지원합니다.
// (안 쓰는 이미지가 계속 쌓이긴 하지만, Cloudinary 무료 한도가 넉넉해서 초기엔 문제 없습니다)
export async function deleteImageByUrl(_url: string) {
  // no-op
}
