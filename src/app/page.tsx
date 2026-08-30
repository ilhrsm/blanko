import { LoginScreen } from "@/components/auth/LoginScreen";

// 첫 화면 = 구글 로그인 화면.
// 로그인된 사용자는 LoginScreen 내부에서 /admin(자신의 쇼핑몰 관리)으로 자동 이동합니다.
export default function HomePage() {
  return <LoginScreen />;
}
