"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { isStoreIdAvailable, isValidStoreId } from "@/lib/firebase/users";
import { Button } from "@/components/ui/Button";

// 이메일/비밀번호로 셀러 계정을 만들면서, 동시에 자기만의 고유 주소
// (shipda.com/상점아이디)를 선점합니다. 다른 소상공인이 들어와도 각자
// 자기 계좌/상품으로 독립된 주문을 받을 수 있도록 상점아이디로 분리됩니다.
export default function SignupPage() {
  const { user, loading, signUpWithEmail } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [shopName, setShopName] = useState("");
  const [storeId, setStoreId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [storeIdError, setStoreIdError] = useState("");

  useEffect(() => {
    if (!loading && user) router.replace("/admin");
  }, [user, loading, router]);

  function handleStoreIdChange(value: string) {
    const normalized = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setStoreId(normalized);
    if (normalized && !isValidStoreId(normalized)) {
      setStoreIdError("영문 소문자/숫자/하이픈으로 2~30자 입력해주세요.");
    } else {
      setStoreIdError("");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!shopName || !email || !password) {
      showToast("모든 항목을 입력해주세요", "error");
      return;
    }
    if (!isValidStoreId(storeId)) {
      setStoreIdError("영문 소문자/숫자/하이픈으로 2~30자 입력해주세요.");
      return;
    }
    if (password.length < 6) {
      showToast("비밀번호는 6자 이상이어야 해요", "error");
      return;
    }

    setSubmitting(true);
    try {
      const available = await isStoreIdAvailable(storeId);
      if (!available) {
        setStoreIdError("이미 사용 중인 상점아이디예요. 다른 이름을 입력해주세요.");
        setSubmitting(false);
        return;
      }
      await signUpWithEmail(email, password, storeId, shopName);
      router.replace("/admin/products/new");
    } catch (err: any) {
      const code = err?.code ?? "";
      if (code === "auth/email-already-in-use") {
        showToast("이미 가입된 이메일이에요. 로그인해주세요.", "error");
      } else if (code === "auth/invalid-email") {
        showToast("이메일 형식을 확인해주세요.", "error");
      } else {
        showToast(err?.message ?? "회원가입 중 오류가 발생했어요.", "error");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center gap-8 px-5 py-16">
      <div className="text-center">
        <p className="font-display text-2xl font-bold text-ink">내 상점 만들기</p>
        <p className="mt-2 font-body text-sm text-muted">
          이메일과 비밀번호, 그리고 나만의 상점아이디를 정하면
          <br />
          shipda.com/상점아이디 주소로 바로 판매를 시작할 수 있어요.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="font-body text-xs text-muted">상점 이름</label>
          <input
            className="signup-input"
            placeholder="예: 민지의 옷장"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-body text-xs text-muted">상점아이디 (내 상점 주소)</label>
          <div className="flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-1 focus-within:outline focus-within:outline-1.5 focus-within:outline-ink">
            <span className="font-mono text-xs text-muted">shipda.com/</span>
            <input
              className="flex-1 border-none bg-transparent py-2 font-mono text-sm text-ink outline-none"
              placeholder="mystore"
              value={storeId}
              onChange={(e) => handleStoreIdChange(e.target.value)}
              required
            />
          </div>
          {storeIdError && <p className="font-body text-xs text-red-500">{storeIdError}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-body text-xs text-muted">이메일</label>
          <input
            type="email"
            className="signup-input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-body text-xs text-muted">비밀번호</label>
          <input
            type="password"
            className="signup-input"
            placeholder="6자 이상"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" disabled={submitting} fullWidth>
          {submitting ? "상점 만드는 중..." : "내 상점 만들기"}
        </Button>
      </form>

      <div className="flex flex-col items-center gap-2 font-body text-xs text-muted">
        <Link href="/login" className="underline underline-offset-2">
          이미 계정이 있어요, 로그인할래요
        </Link>
        <Link href="/" className="underline underline-offset-2">
          Google로 시작하기
        </Link>
      </div>

      <style jsx global>{`
        .signup-input {
          width: 100%;
          border: 1px solid #ebebeb;
          border-radius: 8px;
          padding: 10px 14px;
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Apple SD Gothic Neo",
            "Pretendard Variable", "Malgun Gothic", sans-serif;
          font-size: 14px;
          background: white;
        }
        .signup-input:focus {
          outline: 1.5px solid #0a0a0a;
        }
      `}</style>
    </div>
  );
}
