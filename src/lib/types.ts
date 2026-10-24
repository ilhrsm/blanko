export type UserRole = "user" | "admin";

export interface AppUser {
  uid: string;
  name: string;
  email: string;
  profileImage?: string;
  role: UserRole;
  // 상점 고유 주소 (예: shipda.com/상점아이디). 없으면 uid를 그대로 상점 주소로 사용합니다.
  storeId?: string;
  createdAt: number;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  sellerId: string;
  name: string;
  brand: string;
  price: number;
  description: string;
  specs: ProductSpec[];
  images: string[];
  coverImage: string;
  stock: number;
  hidden: boolean;
  featured: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface CartItem {
  productId: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
}

export type OrderStatus =
  | "waiting_payment"
  | "payment_checking"
  | "paid"
  | "preparing"
  | "shipping"
  | "completed"
  | "cancelled";

export interface OrderItem {
  productId: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  buyerName: string;
  buyerPhone: string;
  shippingAddress: string;
  items: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
  bankInfo: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  createdAt: number;
  updatedAt: number;
}

export interface HeroSettings {
  imageUrl: string;
  title: string;
  description: string;
}

export interface AboutSettings {
  title: string;
  body: string;
}

export interface BusinessInfo {
  companyName: string;
  ceoName: string;
  bizRegNumber: string;
}

export type HeroSize = "sm" | "md" | "lg";
export type CardLayout = "compact" | "cozy" | "wide"; // 한 줄에 4개 / 3개 / 2개
export type CardRatio = "square" | "portrait" | "wide"; // 1:1 / 4:5 / 3:2

// 가판대(메인 페이지) 꾸미기 관련 설정만 모아둔 테마 값
export interface ThemeSettings {
  accentColor: string; // 포인트 컬러 (가격, 강조 요소)
  heroSize: HeroSize; // 가판대(상단 배너) 크기
  cardLayout: CardLayout; // 한 줄에 보이는 상품카드 개수
  cardRatio: CardRatio; // 상품카드 이미지 비율(길이)
}

// 셀러별 쇼핑몰 커스터마이징 설정 (settings/{uid} 문서)
export interface SiteSettings {
  shopName: string;
  // 배경 커스터마이징: 이미지가 있으면 이미지가 우선, 없으면 배경색 사용
  bgColor: string;
  bgImageUrl: string;
  hero: HeroSettings;
  about: AboutSettings;
  featuredProductIds: string[];
  theme: ThemeSettings;
  bankInfo: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  business: BusinessInfo;
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  waiting_payment: "입금 대기",
  payment_checking: "입금 확인 중",
  paid: "결제 완료",
  preparing: "배송 준비중",
  shipping: "배송중",
  completed: "배송 완료",
  cancelled: "주문 취소",
};

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "waiting_payment",
  "payment_checking",
  "paid",
  "preparing",
  "shipping",
  "completed",
];
