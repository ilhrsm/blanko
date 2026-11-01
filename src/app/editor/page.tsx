"use client";

import { useEffect, useState } from "react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { ShopEditorDock } from "@/components/admin/ShopEditorDock";
import type { DockPanel } from "@/components/admin/ShopEditorDock";
import { StoreInfoModal } from "@/components/admin/StoreInfoModal";
import { ShopView } from "@/components/shop/ShopView";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { getVisibleProductsBySeller } from "@/lib/firebase/products";
import { getSellerSettings, updateSellerSettings } from "@/lib/firebase/settings";
import { uploadSellerImage } from "@/lib/firebase/storage";
import { createSlide } from "@/lib/slides";
import type { Product, SiteSettings, Slide, SlideType } from "@/lib/types";

function scrollToSlide(id: string) {
  document.getElementById(`slide-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function ShopEditor() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bgUploading, setBgUploading] = useState(false);
  const [showStoreInfo, setShowStoreInfo] = useState(false);
  const [panel, setPanel] = useState<DockPanel>(null);
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null);

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

  function patchSlide(id: string, next: Partial<Slide>) {
    setSettings((prev) =>
      prev
        ? { ...prev, slides: prev.slides.map((s) => (s.id === id ? { ...s, ...next } : s)) }
        : prev
    );
  }

  // 새 슬라이드는 지금 선택한 슬라이드 바로 아래에 들어갑니다. (선택이 없으면 맨 아래)
  function addSlide(type: SlideType) {
    if (!settings) return;
    const slide = createSlide(type);
    const index = settings.slides.findIndex((s) => s.id === selectedSlideId);
    const at = index < 0 ? settings.slides.length : index + 1;
    const slides = [...settings.slides];
    slides.splice(at, 0, slide);
    patch({ slides });
    setSelectedSlideId(slide.id);
    setTimeout(() => scrollToSlide(slide.id), 60);
  }

  function removeSlide(id: string) {
    if (!settings || settings.slides.length <= 1) return;
    const index = settings.slides.findIndex((s) => s.id === id);
    const slides = settings.slides.filter((s) => s.id !== id);
    patch({ slides });
    // 지운 자리에 있던(없으면 마지막) 슬라이드를 이어서 선택
    setSelectedSlideId(slides[Math.min(Math.max(index, 0), slides.length - 1)].id);
  }

  function moveSlide(id: string, direction: -1 | 1) {
    if (!settings) return;
    const index = settings.slides.findIndex((s) => s.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= settings.slides.length) return;
    const slides = [...settings.slides];
    [slides[index], slides[target]] = [slides[target], slides[index]];
    patch({ slides });
    setTimeout(() => scrollToSlide(id), 60);
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
        selectedSlideId={selectedSlideId}
        onSelectSlide={(id, options) => {
          setSelectedSlideId(id);
          // 슬라이드의 빈 곳을 직접 누르면 색상 패널이 바로 열려서 배경/글씨 색을 바꿀 수 있어요.
          if (options?.fromBackground) setPanel((current) => current ?? "color");
        }}
        onSlideChange={patchSlide}
      />

      <ShopEditorDock
        settings={settings}
        panel={panel}
        onPanelChange={setPanel}
        selectedSlideId={selectedSlideId}
        onSelectSlide={(id) => {
          setSelectedSlideId(id);
          scrollToSlide(id);
        }}
        onSlideChange={patchSlide}
        onAddSlide={addSlide}
        onRemoveSlide={removeSlide}
        onMoveSlide={moveSlide}
        onBgColorChange={(v) => patch({ bgColor: v })}
        onBgImageSelect={handleBgImageSelect}
        onBgImageRemove={() => patch({ bgImageUrl: "" })}
        bgUploading={bgUploading}
        onAccentColorChange={(v) => patchTheme({ accentColor: v })}
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
