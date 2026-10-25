"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import {
  claimStoreId,
  isReservedStoreId,
  isStoreIdAvailable,
  isValidStoreId,
} from "@/lib/firebase/users";
import { initSellerSettings } from "@/lib/firebase/settings";
import { getProductsBySeller } from "@/lib/firebase/products";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

// 구글로 로그인한 셀러가 "나의 가판대"를 만드는 화면입니다.
// 상점아이디를 정하면 https://도메인/상점아이디 주소로 나만의 가판대가 열립니다.
export default function SetupStallPage() {
  const { user, loading, refreshUser } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [shopName, setShopName] = useState("");
  const [storeId, setStoreId] = useState("");
  const [storeIdError, setStoreIdError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/");
      return;
    }
    // 이미 가판대가 있으면 관리자 화면으로
    if (user.storeId) router.replace("/admin");
  }, [user, loading, router]);

  useEffect(() => {
    if (user && !shopName) setShopName(user.name ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  function handleStoreIdChange(value: string) {
    const normalized = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setStoreId(normalized);
    if (normalized && !isValidStoreId(normalized)) {
      setStoreIdError("영문 소문자/숫자/하이픈으로 2~30자 입력해주세요.");
    } else if (isReservedStoreId(normalized)) {
      setStoreIdError("사용할 수 없는 주소예요. 다른 이름을 입력해주세요.");
    } else {
      setStoreIdError("");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!shopName.trim()) {
      showToast("가판대 이름을 입력해주세요", "error");
      return;
    }
    if (!isValidStoreId(storeId)) {
      setStoreIdError("영문 소문자/숫자/하이픈으로 2~30자 입력해주세요.");
      return;
    }
    if (isReservedStoreId(storeId)) {
      setStoreIdError("사용할 수 없는 주소예요. 다른 이름을 입력해주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const available = await isStoreIdAvailable(storeId);
      if (!available) {
        setStoreIdError("이미 사용 중인 주소예요. 다른 이름을 입력해주세요.");
        return;
      }
      await claimStoreId(user.uid, storeId);
      await initSellerSettings(user.uid, shopName.trim());
      await refreshUser();
      showToast("나만의 가판대가 만들어졌어요", "success");

      const products = await getProductsBySeller(user.uid).catch(() => []);
      router.replace(products.length === 0 ? "/admin/products/new" : "/admin");
    } catch (err: any) {
      setStoreIdError(err?.message ?? "가판대를 만들지 못했어요. 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !user || user.storeId) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Spinner size={32} className="animate-spin text-ink/30" />
      </div>
    );
  }

  const host = typeof window !== "undefined" ? window.location.host : "shipda.com";

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center gap-8 px-5 py-16">
      <div className="text-center">
        <p className="font-display text-2xl font-bold text-ink">나의 가판대 만들기</p>
        <p className="mt-2 break-keep font-body text-sm text-muted">
          나만의 주소를 정하면 링크 하나로 가판대가 열려요.
          <br />
          인스타그램 피드나 프로필에 걸어보세요.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="font-body text-xs text-muted">가판대 이름</label>
          <input
            className="setup-input"
            placeholder="예) 블랑코 스토어"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-body text-xs text-muted">가판대 주소</label>
          <div className="flex items-center gap-1.5 rounded-2xl border border-line bg-white px-4 py-1 focus-within:outline focus-within:outline-1.5 focus-within:outline-ink">
            <span className="whitespace-nowrap font-body text-sm text-muted">{host}/</span>
            <input
              className="min-w-0 flex-1 border-none bg-transparent py-2.5 font-body text-sm text-ink outline-none"
              placeholder="mystore"
              value={storeId}
              onChange={(e) => handleStoreIdChange(e.target.value)}
              required
            />
          </div>
          {storeIdError ? (
            <p className="font-body text-xs text-red-500">{storeIdError}</p>
          ) : (
            <p className="font-body text-xs text-muted">영문 소문자, 숫자, 하이픈(-) 2~30자</p>
          )}
        </div>

        <Button type="submit" disabled={submitting} fullWidth>
          {submitting ? "만드는 중..." : "가판대 만들기"}
        </Button>
      </form>

      <style jsx global>{`
        .setup-input {
          width: 100%;
          border: 1px solid #ebebeb;
          border-radius: 16px;
          padding: 12px 16px;
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Apple SD Gothic Neo",
            "Pretendard Variable", "Malgun Gothic", sans-serif;
          font-size: 14px;
          background: white;
        }
        .setup-input:focus {
          outline: 1.5px solid #0a0a0a;
        }
      `}</style>
    </div>
  );
}
