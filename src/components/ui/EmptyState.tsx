import { Spinner } from "./Spinner";
import { Button } from "./Button";
import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  textColor?: string; // 지정하면 제목/설명 글씨색을 이 색으로 (어두운 슬라이드 배경 위에서 사용)
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  textColor,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <Spinner size={40} className="text-ink/25" />
      <div className="space-y-1">
        <p
          className="font-display text-lg font-bold text-ink"
          style={textColor ? { color: textColor } : undefined}
        >
          {title}
        </p>
        {description && (
          <p
            className="font-body text-sm text-muted"
            style={textColor ? { color: textColor, opacity: 0.7 } : undefined}
          >
            {description}
          </p>
        )}
      </div>
      {actionLabel && actionHref && (
        <Link href={actionHref}>
          <Button variant="secondary">{actionLabel}</Button>
        </Link>
      )}
    </div>
  );
}
