import { doc, getDoc, setDoc, deleteDoc, serverTimestamp, runTransaction } from "firebase/firestore";
import { db } from "./client";
import type { AppUser } from "@/lib/types";
import type { User } from "firebase/auth";

const STORE_SLUG_COLLECTION = "storeSlugs";
// 상점아이디(슬러그) 규칙: 영문 소문자/숫자/하이픈, 2~30자, 첫 글자는 영문/숫자
const STORE_ID_REGEX = /^[a-z0-9][a-z0-9-]{1,29}$/;

export function isValidStoreId(storeId: string): boolean {
  return STORE_ID_REGEX.test(storeId);
}

// 멀티테넌트 모델에서는 별도의 관리자 화이트리스트가 없습니다.
// 구글 로그인에 성공한 사용자는 누구나 자신의 uid를 sellerId로 하는
// 자기 자신만의 쇼핑몰(/admin, /[sellerId])을 갖게 됩니다.
export async function ensureUserDocument(firebaseUser: User): Promise<AppUser> {
  const ref = doc(db, "users", firebaseUser.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    const data = snap.data();
    return {
      uid: firebaseUser.uid,
      name: data.name,
      email: data.email,
      profileImage: data.profileImage,
      role: "user",
      storeId: data.storeId,
      createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
    };
  }

  const newUser = {
    uid: firebaseUser.uid,
    name: firebaseUser.displayName ?? "회원",
    email: firebaseUser.email ?? "",
    profileImage: firebaseUser.photoURL ?? "",
    role: "user" as const,
    createdAt: serverTimestamp(),
  };
  await setDoc(ref, newUser);

  return { ...newUser, createdAt: Date.now() };
}

// 이메일/비밀번호로 가입한 셀러의 유저 문서를 생성하고, 곧바로 상점아이디를 선점합니다.
export async function ensureEmailUserDocument(
  firebaseUser: User,
  storeId: string,
  shopName: string
): Promise<AppUser> {
  const ref = doc(db, "users", firebaseUser.uid);
  const newUser = {
    uid: firebaseUser.uid,
    name: shopName || firebaseUser.email?.split("@")[0] || "회원",
    email: firebaseUser.email ?? "",
    profileImage: "",
    role: "user" as const,
    createdAt: serverTimestamp(),
  };
  await setDoc(ref, newUser, { merge: true });
  await claimStoreId(firebaseUser.uid, storeId);

  return { ...newUser, storeId, createdAt: Date.now() };
}

// 상점아이디(슬러그)가 아직 아무도 쓰지 않는지 확인합니다.
export async function isStoreIdAvailable(storeId: string): Promise<boolean> {
  if (!isValidStoreId(storeId)) return false;
  const snap = await getDoc(doc(db, STORE_SLUG_COLLECTION, storeId));
  return !snap.exists();
}

// 상점아이디(슬러그) → uid 매핑을 조회합니다. 매핑이 없으면 null을 반환합니다.
export async function getUidByStoreId(storeId: string): Promise<string | null> {
  const snap = await getDoc(doc(db, STORE_SLUG_COLLECTION, storeId));
  if (!snap.exists()) return null;
  return (snap.data().uid as string) ?? null;
}

// 셀러가 자신만의 고유 주소(shipda.com/상점아이디)를 등록/변경합니다.
// storeSlugs/{storeId} 문서를 트랜잭션으로 선점하여 중복 등록을 막습니다.
export async function claimStoreId(uid: string, storeId: string): Promise<void> {
  if (!isValidStoreId(storeId)) {
    throw new Error("상점아이디는 영문 소문자/숫자/하이픈으로 2자 이상 입력해주세요.");
  }

  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  const prevStoreId = userSnap.exists() ? (userSnap.data().storeId as string | undefined) : undefined;

  await runTransaction(db, async (tx) => {
    const slugRef = doc(db, STORE_SLUG_COLLECTION, storeId);
    const slugSnap = await tx.get(slugRef);
    if (slugSnap.exists() && slugSnap.data().uid !== uid) {
      throw new Error("이미 사용 중인 상점아이디입니다.");
    }
    tx.set(slugRef, { uid, createdAt: serverTimestamp() });
    tx.set(userRef, { storeId }, { merge: true });
  });

  // 이전에 다른 슬러그를 쓰고 있었다면 정리합니다.
  if (prevStoreId && prevStoreId !== storeId) {
    await deleteDoc(doc(db, STORE_SLUG_COLLECTION, prevStoreId)).catch(() => {});
  }
}

export async function getUserDocument(uid: string): Promise<AppUser | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    uid,
    name: data.name,
    email: data.email,
    profileImage: data.profileImage,
    role: data.role ?? "user",
    storeId: data.storeId,
    createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
  };
}
