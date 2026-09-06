"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { getProductsBySeller } from "@/lib/firebase/products";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const { user, loading, signInWithEmail, signInWithGoogle } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) goToSellerHome(user.uid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  async function goToSellerHome(uid: string) {
    try {
      const products = await getProductsBySeller(uid);
      router.replace(products.length === 0 ? "/admin/products/new" : "/admin");
    } catch {
      router.replace("/admin");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      showToast("이메일과 비밀번호를 입력해주세요", "error");
      return;
    }
    setSubmitting(true);
    try {
      await signInWithEmail(email, password);
    } catch {
      showToast("이메일 또는 비밀번호가 올바르지 않아요.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center gap-8 px-5 py-16">
      <div className="text-center">
        <p className="font-display text-2xl font-bold text-ink">로그인</p>
        <p className="mt-2 font-body text-sm text-muted">내 상점 관리자 페이지로 이동해요.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          className="login-input"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="login-input"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" disabled={submitting} fullWidth>
          {submitting ? "로그인 중..." : "로그인"}
        </Button>
      </form>

      <div className="flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-line" />
        또는
        <span className="h-px flex-1 bg-line" />
      </div>

      <Button variant="secondary" fullWidth onClick={signInWithGoogle}>
        Google로 계속하기
      </Button>

      <Link href="/signup" className="text-center font-body text-xs text-muted underline underline-offset-2">
        아직 상점이 없으신가요? 상점 만들기
      </Link>

      <style jsx global>{`
        .login-input {
          width: 100%;
          border: 1px solid #ebebeb;
          border-radius: 8px;
          padding: 10px 14px;
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Apple SD Gothic Neo",
            "Pretendard Variable", "Malgun Gothic", sans-serif;
          font-size: 14px;
          background: white;
        }
        .login-input:focus {
          outline: 1.5px solid #0a0a0a;
        }
      `}</style>
    </div>
  );
}
