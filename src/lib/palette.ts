// 캔바 스타일 색상 팔레트. 한 줄에 8개씩 보여주도록 8의 배수로 맞춰져 있습니다.

// 단색: 무채색 / 파스텔 / 비비드 / 딥톤
export const SOLID_COLORS = [
  // 무채색
  "#FFFFFF", "#F5F1EA", "#E5E7EB", "#9CA3AF", "#6B7280", "#374151", "#1F2937", "#0A0A0A",
  // 파스텔
  "#FECACA", "#FED7AA", "#FEF08A", "#BBF7D0", "#99F6E4", "#BAE6FD", "#C7D2FE", "#FBCFE8",
  // 비비드
  "#EF4444", "#F97316", "#EAB308", "#22C55E", "#14B8A6", "#3B82F6", "#6366F1", "#EC4899",
  // 딥톤
  "#991B1B", "#9A3412", "#854D0E", "#166534", "#115E59", "#1E40AF", "#3730A3", "#9D174D",
] as const;

// 슬라이드 배경 전용 그라데이션
export const GRADIENTS = [
  "linear-gradient(135deg, #FDE68A, #F87171)",
  "linear-gradient(135deg, #A5F3FC, #6366F1)",
  "linear-gradient(135deg, #FBCFE8, #C7D2FE)",
  "linear-gradient(135deg, #BBF7D0, #14B8A6)",
  "linear-gradient(135deg, #FED7AA, #EC4899)",
  "linear-gradient(135deg, #1F2937, #6366F1)",
  "linear-gradient(135deg, #0A0A0A, #3B3A38)",
  "linear-gradient(180deg, #F5F1EA, #FFFFFF)",
] as const;

// 글씨색은 읽기 쉬운 무채색 줄 + 비비드 줄만 노출
export const TEXT_COLORS = [...SOLID_COLORS.slice(0, 8), ...SOLID_COLORS.slice(16, 24)];

// 포인트 컬러(가격 등)도 비비드 + 딥톤 위주로 노출
export const ACCENT_COLORS = [...SOLID_COLORS.slice(16, 24), ...SOLID_COLORS.slice(24, 32)];

// 페이지 배경은 무채색 + 파스텔 줄
export const PAGE_BG_COLORS = SOLID_COLORS.slice(0, 16);
