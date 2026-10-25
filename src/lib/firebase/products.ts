import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./client";
import type { Product } from "@/lib/types";

const COLLECTION = "products";

function mapDoc(id: string, data: any): Product {
  return {
    id,
    sellerId: data.sellerId ?? "",
    name: data.name,
    brand: data.brand,
    price: data.price,
    description: data.description ?? "",
    specs: data.specs ?? [],
    images: data.images ?? [],
    coverImage: data.coverImage ?? data.images?.[0] ?? "",
    stock: data.stock ?? 0,
    hidden: data.hidden ?? false,
    featured: data.featured ?? false,
    createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
    updatedAt: data.updatedAt?.toMillis?.() ?? Date.now(),
  };
}

// 특정 셀러의 노출 상품만 (구매자용 쇼핑몰 페이지 - app/[sellerId])
export async function getVisibleProductsBySeller(sellerId: string): Promise<Product[]> {
  // sellerId 단일 조건 + hidden은 클라이언트 필터 (복합 인덱스 생성 없이 바로 동작)
  const items = await getProductsBySeller(sellerId);
  return items.filter((p) => !p.hidden);
}

export async function getFeaturedProductsBySeller(sellerId: string): Promise<Product[]> {
  const items = await getVisibleProductsBySeller(sellerId);
  return items.filter((p) => p.featured);
}

export async function getProductById(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return mapDoc(snap.id, snap.data());
}

// 현재 로그인한 셀러의 전체 상품 (숨김 포함) - /admin/products
export async function getProductsBySeller(sellerId: string): Promise<Product[]> {
  const q = query(collection(db, COLLECTION), where("sellerId", "==", sellerId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapDoc(d.id, d.data())).sort((a, b) => b.createdAt - a.createdAt);
}

export async function createProduct(
  sellerId: string,
  input: Omit<Product, "id" | "sellerId" | "createdAt" | "updatedAt">
) {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...input,
    sellerId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateProduct(id: string, input: Partial<Product>) {
  // sellerId는 수정 대상에서 항상 제외 (보안 규칙으로도 한 번 더 막지만 클라이언트에서도 방어)
  const { sellerId, id: _id, ...rest } = input;
  await updateDoc(doc(db, COLLECTION, id), { ...rest, updatedAt: serverTimestamp() });
}

export async function deleteProduct(id: string) {
  await deleteDoc(doc(db, COLLECTION, id));
}
