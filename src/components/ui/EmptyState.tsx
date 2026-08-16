import { Aperture } from "./Aperture";
import { Button } from "./Button";
import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({ title, description, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <Aperture size={40} className="text-ink/25" />
      <div className="space-y-1">
        <p className="font-display text-lg text-ink">{title}</p>
        {description && <p className="font-body text-sm text-muted">{description}</p>}
      </div>
      {actionLabel && actionHref && (
        <Link href={actionHref}>
          <Button variant="secondary">{actionLabel}</Button>
        </Link>
      )}
    </div>
  );
}
