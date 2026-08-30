import { Aperture } from "@/components/ui/Aperture";

export default function Loading() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <Aperture size={36} className="animate-spin text-ink/25" />
    </div>
  );
}
