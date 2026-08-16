interface ApertureProps {
  size?: number;
  className?: string;
  blades?: number;
}

/**
 * Brand signature mark — a camera aperture iris rendered in line form.
 * Used sparingly as a loading indicator, section divider, and empty-state glyph.
 */
export function Aperture({ size = 24, className, blades = 6 }: ApertureProps) {
  const items = Array.from({ length: blades });
  const radius = size / 2;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      fill="none"
    >
      <circle cx={radius} cy={radius} r={radius - 1} stroke="currentColor" strokeWidth="1" opacity={0.3} />
      {items.map((_, i) => {
        const angle = (360 / blades) * i;
        return (
          <line
            key={i}
            x1={radius}
            y1={radius}
            x2={radius + (radius - 3) * Math.cos((angle * Math.PI) / 180)}
            y2={radius + (radius - 3) * Math.sin((angle * Math.PI) / 180)}
            stroke="currentColor"
            strokeWidth="1"
            opacity={0.5}
          />
        );
      })}
      <circle cx={radius} cy={radius} r={radius / 4} stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
