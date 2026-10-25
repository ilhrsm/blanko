"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { claimStoreId, isStoreIdAvailable, isValidStoreId } from "@/lib/firebase/users";
import type { SiteSettings } from "@/lib/types";

interface StoreInfoModalProps {
  settings: SiteSettings;
  onPatch: (patch: Partial<SiteSettings>) => void;
  onClose: () => void;
}

export function StoreInfoModal({ settings, onPatch, onClose }: StoreInfoModalProps) {
  const { user } = useAuth();
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

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-ink/40 px-4 pb-4 md:items-center md:px-6">
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-surface p-6 shadow-xl md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <p className="font-display text-lg font-bold text-ink">상점 정보</p>
          <button type="button" onClick={onClose} className="font-body text-sm text-muted">
            닫기
          </button>
        </div>

        <section className="mb-8">
          <h3 className="mb-3 font-body text-sm font-medium text-ink">내 상점 주소</h3>
          <p className="mb-3 font-body text-xs text-muted">
            다른 소상공인과 겹치지 않는 나만의 고유 주소예요. 인스타그램 프로필 링크로 바로 걸어보세요.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-1 min-w-[200px] items-center gap-2 rounded-lg border border-line bg-white px-3 py-1 focus-within:outline focus-within:outline-1.5 focus-within:outline-ink">
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

        <section className="mb-8">
          <h3 className="mb-3 font-body text-sm font-medium text-ink">쇼핑몰 이름</h3>
          <input
            className="settings-input"
            placeholder="쇼핑몰 이름"
            value={settings.shopName}
            onChange={(e) => onPatch({ shopName: e.target.value })}
          />
        </section>

        <section className="mb-8">
          <h3 className="mb-3 font-body text-sm font-medium text-ink">정산 계좌 정보 (선택)</h3>
          <p className="mb-3 font-body text-xs text-muted">
            정산받을 계좌를 참고용으로 남겨두면 주문 상세에서 함께 표시돼요.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <input
              className="settings-input"
              placeholder="은행명"
              value={settings.bankInfo.bankName}
              onChange={(e) => onPatch({ bankInfo: { ...settings.bankInfo, bankName: e.target.value } })}
            />
            <input
              className="settings-input"
              placeholder="계좌번호"
              value={settings.bankInfo.accountNumber}
              onChange={(e) =>
                onPatch({ bankInfo: { ...settings.bankInfo, accountNumber: e.target.value } })
              }
            />
            <input
              className="settings-input"
              placeholder="예금주"
              value={settings.bankInfo.accountHolder}
              onChange={(e) =>
                onPatch({ bankInfo: { ...settings.bankInfo, accountHolder: e.target.value } })
              }
            />
          </div>
        </section>

        <p className="font-body text-[11px] text-muted">
          이름/계좌 정보는 화면 하단의 저장 버튼을 눌러야 함께 저장돼요. 상점 주소만 별도로 즉시 저장됩니다.
        </p>

        <style jsx global>{`
          .settings-input {
            width: 100%;
            border: 1px solid #ebebeb;
            border-radius: 8px;
            padding: 10px 14px;
            font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Apple SD Gothic Neo",
              "Pretendard Variable", "Malgun Gothic", sans-serif;
            font-size: 14px;
            background: white;
          }
          .settings-input:focus {
            outline: 1.5px solid #0a0a0a;
          }
        `}</style>
      </div>
    </div>
  );
}
