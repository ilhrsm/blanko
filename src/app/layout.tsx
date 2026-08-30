import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";

export const metadata: Metadata = {
  title: "Shipda | 내 첫 번째 모바일 가판대",
  description:
    "인스타그램 소상공인과 1인 창업자를 위한 완전 무료 쇼핑몰 빌더, Shipda. 링크 하나로 나만의 상점을 시작하세요.",
  openGraph: {
    title: "Shipda",
    description: "링크 하나로 시작하는 내 첫 번째 모바일 가판대",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-ivory font-body text-ink antialiased">
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <Navbar />
              <CartDrawer />
              <main className="min-h-[60vh]">{children}</main>
              <Footer />
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
