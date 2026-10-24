"use client";

import { useEffect, useState } from "react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { ShopEditorDock } from "@/components/admin/ShopEditorDock";
import { StoreInfoModal } from "@/components/admin/StoreInfoModal";
import { ShopView } from "@/components/shop/ShopView";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { getVisibleProductsBySeller } from "@/lib/firebase/products";
import { getSellerSettings, updateSellerSettings } from "@/lib/firebase/settings";
import { uploadSellerImage } from "@/lib/firebase/storage";
import type { Product, SiteSettings } from "@/lib/types";

function ShopEditor() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bgUploading, setBgUploading] = useState(false);
  const [showStoreInfo, setShowStoreInfo] = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.all([getSellerSettings(user.uid), getVisibleProductsBySeller(user.uid)]).then(
      ([nextSettings, nextProducts]) => {
        setSettings(nextSettings);
        setProducts(nextProducts);
        setLoading(false);
      }
    );
  }, [user]);

  function patch(next: Partial<SiteSettings>) {
    setSettings((prev) => (prev ? { ...prev, ...next } : prev));
  }

  function patchTheme(next: Partial<SiteSettings["theme"]>) {
    setSettings((prev) => (prev ? { ...prev, theme: { ...prev.theme, ...next } } : prev));
  }

  async function handleBgImageSelect(file: File) {
    if (!user) return;
    setBgUploading(true);
    try {
      const url = await uploadSellerImage(file, user.uid);
      patch({ bgImageUrl: url });
    } finally {
      setBgUploading(false);
    }
  }

  async function handleSave() {
    if (!user || !settings) return;
    setSaving(true);
    try {
      await updateSellerSettings(user.uid, settings);
      showToast("가판대가 저장되었습니다", "success");
    } catch {
      showToast("저장에 실패했습니다", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !settings || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size={32} className="animate-spin text-ink/30" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32">
      <ShopView
        settings={settings}
        products={products}
        editable
        onHeroTitleChange={(v) => patch({ hero: { ...settings.hero, title: v } })}
        onHeroDescriptionChange={(v) => patch({ hero: { ...settings.hero, description: v } })}
        onAboutTitleChange={(v) => patch({ about: { ...settings.about, title: v } })}
        onAboutBodyChange={(v) => patch({ about: { ...settings.about, body: v } })}
      />

      <ShopEditorDock
        settings={settings}
        onBgColorChange={(v) => patch({ bgColor: v })}
        onBgImageSelect={handleBgImageSelect}
        onBgImageRemove={() => patch({ bgImageUrl: "" })}
        bgUploading={bgUploading}
        onAccentColorChange={(v) => patchTheme({ accentColor: v })}
        onHeroSizeChange={(v) => patchTheme({ heroSize: v })}
        onCardLayoutChange={(v) => patchTheme({ cardLayout: v })}
        onCardRatioChange={(v) => patchTheme({ cardRatio: v })}
        onOpenStoreInfo={() => setShowStoreInfo(true)}
        onSave={handleSave}
        saving={saving}
      />

      {showStoreInfo && (
        <StoreInfoModal settings={settings} onPatch={patch} onClose={() => setShowStoreInfo(false)} />
      )}
    </div>
  );
}

export default function EditorPage() {
  return (
    <AdminGuard>
      <ShopEditor />
    </AdminGuard>
  );
}
