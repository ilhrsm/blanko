interface SpinnerProps {
  size?: number;
  className?: string;
}

/**
 * 로딩 인디케이터 / 빈 상태 아이콘으로 쓰이는 미니멀한 원형 스피너.
 */
export function Spinner({ size = 24, className }: SpinnerProps) {
  const radius = size / 2;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      fill="none"
    >
      <circle cx={radius} cy={radius} r={radius - 2} stroke="currentColor" strokeWidth="1.5" opacity={0.2} />
      <path
        d={`M${radius} 2 A${radius - 2} ${radius - 2} 0 0 1 ${size - 2} ${radius}`}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
