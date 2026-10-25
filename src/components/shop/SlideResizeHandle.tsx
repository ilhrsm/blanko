"use client";

import { useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import { cn } from "@/lib/utils";
import { MAX_SLIDE_HEIGHT, MIN_SLIDE_HEIGHT } from "@/lib/slides";

interface SlideResizeHandleProps {
  // 슬라이드가 선택돼 있으면 손잡이를 항상 보여줍니다. (아니면 슬라이드에 마우스를 올렸을 때만)
  selected: boolean;
  // 저장된 높이(px). 0이면 자동.
  height: number;
  onResize: (height: number) => void;
  onStart?: () => void;
}

// 슬라이드 아래쪽 경계선에 붙는 "끌어서 높이 조절" 손잡이 (캔바처럼 마우스/터치로 위아래로 끌면 됩니다)
// 부모 <section>을 직접 측정해서 계산하므로, 슬라이드는 relative + data-slide-content 래퍼만 있으면 됩니다.
export function SlideResizeHandle({ selected, height, onResize, onStart }: SlideResizeHandleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ startY: number; startH: number; minH: number; maxH: number } | null>(null);
  const [live, setLive] = useState<number | null>(null);

  // 내용(글/상품카드)보다 작게 줄여서 잘리는 일이 없도록, 내용 높이를 최소값으로 잡습니다.
  function measure() {
    const section = ref.current?.closest("section");
    if (!section) return null;
    const content = section.querySelector<HTMLElement>("[data-slide-content]");
    const style = getComputedStyle(section);
    const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    const natural = content ? Math.ceil(content.offsetHeight + padding) : MIN_SLIDE_HEIGHT;
    const minH = Math.max(MIN_SLIDE_HEIGHT, natural);
    return {
      startH: section.getBoundingClientRect().height,
      minH,
      maxH: Math.max(MAX_SLIDE_HEIGHT, minH),
    };
  }

  function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    const m = measure();
    if (!m) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { startY: e.clientY, ...m };
    setLive(Math.round(m.startH));
    onStart?.();
  }

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d) return;
    const next = Math.round(Math.min(Math.max(d.startH + (e.clientY - d.startY), d.minH), d.maxH));
    setLive(next);
    onResize(next);
  }

  function endDrag(e: PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    drag.current = null;
    setLive(null);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }

  // 키보드로도 조절 가능: ↑↓ = 10px, Shift 누르면 50px
  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
    e.preventDefault();
    const m = measure();
    if (!m) return;
    const step = (e.shiftKey ? 50 : 10) * (e.key === "ArrowDown" ? 1 : -1);
    const base = height > 0 ? height : m.startH;
    onResize(Math.round(Math.min(Math.max(base + step, m.minH), m.maxH)));
  }

  const dragging = live !== null;

  return (
    <div
      ref={ref}
      role="separator"
      aria-orientation="horizontal"
      aria-label="슬라이드 높이 조절 (위아래로 드래그)"
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={handleKeyDown}
      className="group/handle absolute inset-x-0 bottom-0 z-20 flex h-6 translate-y-1/2 cursor-row-resize touch-none select-none items-center justify-center outline-none"
    >
      {/* 경계선 */}
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 h-0.5 bg-indigo-500 transition-opacity",
          dragging || selected
            ? "opacity-100"
            : "opacity-0 group-hover/slide:opacity-60 group-hover/handle:!opacity-100 group-focus-visible/handle:!opacity-100"
        )}
      />
      {/* 잡는 부분 */}
      <div
        className={cn(
          "pointer-events-none relative h-2.5 w-14 rounded-full border-2 border-indigo-500 bg-white shadow-md transition-all",
          dragging
            ? "scale-110 opacity-100"
            : selected
              ? "opacity-100"
              : "opacity-0 group-hover/slide:opacity-100 group-focus-visible/handle:opacity-100"
        )}
      />
      {/* 드래그 중 현재 높이 표시 */}
      {dragging && (
        <div className="pointer-events-none absolute right-4 -top-8 rounded-md bg-indigo-600 px-2 py-1 font-mono text-[11px] font-medium text-white shadow">
          {live}px
        </div>
      )}
    </div>
  );
}
