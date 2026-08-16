import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "./client";

export async function uploadProductImage(
  file: File,
  sellerId: string,
  productId: string
): Promise<string> {
  const path = `products/${sellerId}/${productId}/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

// 셀러 쇼핑몰의 배경 이미지 / 히어로 이미지 업로드
export async function uploadSellerImage(file: File, sellerId: string): Promise<string> {
  const path = `sellers/${sellerId}/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function deleteImageByUrl(url: string) {
  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch {
    // ignore missing objects
  }
}
