"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getSellerSettings, updateSellerSettings } from "@/lib/firebase/settings";
import { uploadSellerImage } from "@/lib/firebase/storage";
import { claimStoreId, isStoreIdAvailable, isValidStoreId } from "@/lib/firebase/users";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import type { SiteSettings } from "@/lib/types";

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const [storeId, setStoreId] = useState(user?.storeId ?? "");
  const [storeIdError, setStoreIdError] = useState("");
  const [savingStoreId, setSavingStoreId] = useState(false);

  useEffect(() => {
    setStoreId(user?.storeId ?? "");
  }, [user?.storeId]);

  async function handleSaveStoreId() {
    if (!user) return;
    if (!isValidStoreId(storeId)) {
      setStoreIdError("영문 소문자/숫자/하이픈으로 2~30자 입력해주세요.");
      return;
    }
    setSavingStoreId(true);
    setStoreIdError("");
    try {
      if (storeId !== user.storeId) {
        const available = await isStoreIdAvailable(storeId);
        if (!available) {
          setStoreIdError("이미 사용 중인 상점아이디예요.");
          setSavingStoreId(false);
          return;
        }
      }
      await claimStoreId(user.uid, storeId);
      showToast("상점 주소가 저장되었습니다", "success");
    } catch (err: any) {
      setStoreIdError(err?.message ?? "저장에 실패했습니다.");
    } finally {
      setSavingStoreId(false);
    }
  }

  useEffect(() => {
    if (!user) return;
    getSellerSettings(user.uid)
      .then(setSettings)
      .finally(() => setLoading(false));
  }, [user]);

  if (loading || !settings || !user) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size={28} className="animate-spin text-ink/25" />
      </div>
    );
  }

  async function handleBgImage(file: File | undefined) {
    if (!file || !user) return;
    setUploading(true);
    try {
      const url = await uploadSellerImage(file, user.uid);
      setSettings((prev) => (prev ? { ...prev, bgImageUrl: url } : prev));
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!settings || !user) return;
    setSaving(true);
    try {
      await updateSellerSettings(user.uid, settings);
      showToast("쇼핑몰 설정이 저장되었습니다", "success");
    } catch {
      showToast("저장에 실패했습니다", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="pb-24">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink">내 쇼핑몰 관리</h1>
        <Link
          href={`/${user.storeId || user.uid}`}
          target="_blank"
          className="font-body text-xs text-accent underline"
        >
          내 쇼핑몰 보러가기 →
        </Link>
      </div>

      <section className="mb-10">
        <h2 className="mb-4 font-body text-sm font-medium text-ink">내 상점 주소</h2>
        <p className="mb-4 font-body text-xs text-muted">
          다른 소상공인과 겹치지 않는 나만의 고유 주소예요. 인스타그램 프로필 링크로 바로 걸어보세요.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-1 min-w-[220px] items-center gap-2 rounded-lg border border-line bg-white px-3 py-1 focus-within:outline focus-within:outline-1.5 focus-within:outline-ink">
            <span className="font-mono text-xs text-muted">shipda.com/</span>
            <input
              className="flex-1 border-none bg-transparent py-2 font-mono text-sm text-ink outline-none"
              placeholder="mystore"
              value={storeId}
              onChange={(e) => setStoreId(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
            />
          </div>
          <Button variant="secondary" onClick={handleSaveStoreId} disabled={savingStoreId}>
            {savingStoreId ? "저장 중..." : "주소 저장"}
          </Button>
        </div>
        {storeIdError && <p className="mt-2 font-body text-xs text-red-500">{storeIdError}</p>}
      </section>

      <section className="mb-10">
        <h2 className="mb-4 font-body text-sm font-medium text-ink">쇼핑몰 이름</h2>
        <input
          className="settings-input"
          placeholder="쇼핑몰 이름"
          value={settings.shopName}
          onChange={(e) => setSettings((prev) => (prev ? { ...prev, shopName: e.target.value } : prev))}
        />
      </section>

      <section className="mb-10">
        <h2 className="mb-4 font-body text-sm font-medium text-ink">쇼핑몰 배경 꾸미기</h2>
        <p className="mb-4 font-body text-xs text-muted">
          배경 이미지를 등록하면 이미지가 우선 표시되고, 이미지가 없으면 배경색이 적용됩니다.
        </p>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="font-body text-xs text-muted">배경색</span>
          <input
            type="color"
            value={settings.bgColor}
            onChange={(e) => setSettings((prev) => (prev ? { ...prev, bgColor: e.target.value } : prev))}
            className="h-9 w-16 cursor-pointer rounded border border-line bg-transparent"
          />
          <input
            className="settings-input max-w-[160px]"
            value={settings.bgColor}
            onChange={(e) => setSettings((prev) => (prev ? { ...prev, bgColor: e.target.value } : prev))}
          />
        </div>

        <div
          className="relative mb-3 aspect-[16/7] overflow-hidden rounded-lg border border-line"
          style={{ backgroundColor: settings.bgColor }}
        >
          {settings.bgImageUrl && (
            <Image src={settings.bgImageUrl} alt="배경 이미지" fill className="object-cover" />
          )}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-3 right-3 rounded-full bg-surface/90 px-4 py-2 font-body text-xs text-ink"
          >
            {uploading ? "업로드 중..." : "배경 이미지 변경"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleBgImage(e.target.files?.[0])}
          />
        </div>
        {settings.bgImageUrl && (
          <button
            type="button"
            onClick={() => setSettings((prev) => (prev ? { ...prev, bgImageUrl: "" } : prev))}
            className="font-body text-xs text-muted underline"
          >
            배경 이미지 제거하고 배경색만 사용
          </button>
        )}
      </section>

      <section className="mb-10">
        <h2 className="mb-4 font-body text-sm font-medium text-ink">Hero (쇼핑몰 상단 문구)</h2>
        <div className="flex flex-col gap-3">
          <input
            className="settings-input"
            placeholder="Hero 제목"
            value={settings.hero.title}
            onChange={(e) =>
              setSettings((prev) => (prev ? { ...prev, hero: { ...prev.hero, title: e.target.value } } : prev))
            }
          />
          <textarea
            className="settings-input resize-none"
            rows={2}
            placeholder="Hero 설명"
            value={settings.hero.description}
            onChange={(e) =>
              setSettings((prev) =>
                prev ? { ...prev, hero: { ...prev.hero, description: e.target.value } } : prev
              )
            }
          />
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 font-body text-sm font-medium text-ink">About</h2>
        <div className="flex flex-col gap-3">
          <input
            className="settings-input"
            placeholder="About 제목"
            value={settings.about.title}
            onChange={(e) =>
              setSettings((prev) => (prev ? { ...prev, about: { ...prev.about, title: e.target.value } } : prev))
            }
          />
          <textarea
            className="settings-input resize-none"
            rows={8}
            placeholder="About 본문"
            value={settings.about.body}
            onChange={(e) =>
              setSettings((prev) => (prev ? { ...prev, about: { ...prev.about, body: e.target.value } } : prev))
            }
          />
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 font-body text-sm font-medium text-ink">정산 계좌 정보 (선택)</h2>
        <p className="mb-4 font-body text-xs text-muted">
          Shipda는 사업자 등록 없이 가결제로 바로 주문을 받을 수 있어요. 정산받을 계좌를 참고용으로
          남겨두면 주문 상세에서 함께 표시돼요.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <input
            className="settings-input"
            placeholder="은행명"
            value={settings.bankInfo.bankName}
            onChange={(e) =>
              setSettings((prev) =>
                prev ? { ...prev, bankInfo: { ...prev.bankInfo, bankName: e.target.value } } : prev
              )
            }
          />
          <input
            className="settings-input"
            placeholder="계좌번호"
            value={settings.bankInfo.accountNumber}
            onChange={(e) =>
              setSettings((prev) =>
                prev ? { ...prev, bankInfo: { ...prev.bankInfo, accountNumber: e.target.value } } : prev
              )
            }
          />
          <input
            className="settings-input"
            placeholder="예금주"
            value={settings.bankInfo.accountHolder}
            onChange={(e) =>
              setSettings((prev) =>
                prev ? { ...prev, bankInfo: { ...prev.bankInfo, accountHolder: e.target.value } } : prev
              )
            }
          />
        </div>
      </section>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? "저장 중..." : "변경사항 저장"}
      </Button>

      <style jsx global>{`
        .settings-input {
          width: 100%;
          border: 1px solid #e7e1d7;
          border-radius: 8px;
          padding: 10px 14px;
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Apple SD Gothic Neo",
            "Pretendard Variable", "Malgun Gothic", sans-serif;
          font-size: 14px;
          background: white;
        }
        .settings-input:focus {
          outline: 1.5px solid #b2532f;
        }
      `}</style>
    </div>
  );
}
