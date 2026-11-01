import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./client";
import type { Order, OrderStatus } from "@/lib/types";

const COLLECTION = "orders";

function mapDoc(id: string, data: any): Order {
  return {
    id,
    orderNumber: data.orderNumber,
    userId: data.userId,
    sellerId: data.sellerId ?? "",
    groupId: data.groupId,
    buyerName: data.buyerName,
    buyerPhone: data.buyerPhone,
    shippingAddress: data.shippingAddress,
    items: data.items ?? [],
    totalPrice: data.totalPrice ?? 0,
    status: data.status ?? "waiting_payment",
    bankInfo: data.bankInfo ?? { bankName: "", accountNumber: "", accountHolder: "" },
    createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
    updatedAt: data.updatedAt?.toMillis?.() ?? Date.now(),
  };
}

export async function createOrder(input: Omit<Order, "id" | "createdAt" | "updatedAt">) {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getOrderById(id: string): Promise<Order | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return mapDoc(snap.id, snap.data());
}

export async function getOrdersByUser(userId: string): Promise<Order[]> {
  const q = query(collection(db, COLLECTION), where("userId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapDoc(d.id, d.data())).sort((a, b) => b.createdAt - a.createdAt);
}

// 셀러 본인에게 들어온 주문만 조회합니다. (sellerId 조건이 Firestore 규칙과 일치해야 읽기가 허용돼요)
export async function getOrdersBySeller(sellerId: string): Promise<Order[]> {
  const q = query(collection(db, COLLECTION), where("sellerId", "==", sellerId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapDoc(d.id, d.data())).sort((a, b) => b.createdAt - a.createdAt);
}

// (운영자 전용) 전체 주문 조회 — users/{uid}.role 이 'admin'인 계정만 가능합니다.
export async function getAllOrdersForAdmin(): Promise<Order[]> {
  const snap = await getDocs(collection(db, COLLECTION));
  return snap.docs.map((d) => mapDoc(d.id, d.data())).sort((a, b) => b.createdAt - a.createdAt);
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  await updateDoc(doc(db, COLLECTION, id), { status, updatedAt: serverTimestamp() });
}
