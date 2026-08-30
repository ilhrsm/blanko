"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { uploadProductImage, deleteImageByUrl } from "@/lib/firebase/storage";
import { useToast } from "@/context/ToastContext";

interface ImageUploaderProps {
  sellerId: string;
  productId: string;
  images: string[];
  coverImage: string;
  onChange: (images: string[], coverImage: string) => void;
}

export function ImageUploader({ sellerId, productId, images, coverImage, onChange }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const urls = await Promise.all(
        Array.from(files).map((file) => uploadProductImage(file, sellerId, productId))
      );
      const next = [...images, ...urls];
      onChange(next, coverImage || next[0]);
      showToast("이미지가 업로드되었습니다", "success");
    } catch {
      showToast("이미지 업로드에 실패했습니다", "error");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function removeImage(url: string) {
    const next = images.filter((i) => i !== url);
    onChange(next, coverImage === url ? next[0] ?? "" : coverImage);
    deleteImageByUrl(url);
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((url) => (
          <div
            key={url}
            className="group relative aspect-square overflow-hidden rounded-md border border-line"
          >
            <Image src={url} alt="상품 이미지" fill className="object-cover" />
            <button
              type="button"
              onClick={() => onChange(images, url)}
              className={`absolute left-1 top-1 rounded-full px-2 py-0.5 font-body text-[10px] ${
                coverImage === url ? "bg-ink text-ivory" : "bg-surface/80 text-ink"
              }`}
            >
              대표
            </button>
            <button
              type="button"
              onClick={() => removeImage(url)}
              className="absolute right-1 top-1 rounded-full bg-surface/80 px-1.5 py-0.5 text-[10px] text-ink opacity-0 transition-opacity group-hover:opacity-100"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex aspect-square flex-col items-center justify-center gap-1 rounded-md border border-dashed border-line text-muted disabled:opacity-50"
        >
          <span className="text-3xl font-light">+</span>
          <span className="font-body text-xs">{uploading ? "업로드 중" : "이미지 추가"}</span>
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
