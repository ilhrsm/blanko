import { Spinner } from "@/components/ui/Spinner";

export default function Loading() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <Spinner size={36} className="animate-spin text-ink/25" />
    </div>
  );
}
