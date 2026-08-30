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

// 셀러별 쇼핑몰 커스터마이징 설정 (settings/{uid} 문서)
export interface SiteSettings {
  shopName: string;
  // 배경 커스터마이징: 이미지가 있으면 이미지가 우선, 없으면 배경색 사용
  bgColor: string;
  bgImageUrl: string;
  hero: HeroSettings;
  about: AboutSettings;
  featuredProductIds: string[];
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
