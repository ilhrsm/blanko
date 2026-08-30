"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Aperture } from "@/components/ui/Aperture";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Aperture size={32} className="animate-spin text-ink/30" />
      </div>
    );
  }

  return <>{children}</>;
}
