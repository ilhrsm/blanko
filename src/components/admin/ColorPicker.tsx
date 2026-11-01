"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const HEX6 = /^#[0-9a-f]{6}$/i;
const HEX3_OR_6 = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function isHex(value: string): boolean {
  return HEX3_OR_6.test(value.trim());
}

// <input type="color">는 #rrggbb만 받기 때문에 3자리/그라데이션 값은 안전한 값으로 바꿔서 넘깁니다.
function toHex6(value: string): string {
  const v = value.trim();
  if (!isHex(v)) return "#ffffff";
  if (v.length === 4) return "#" + [...v.slice(1)].map((c) => c + c).join("").toLowerCase();
  return v.toLowerCase();
}

export function Swatch({
  color,
  selected,
  onClick,
  label,
}: {
  color: string;
  selected: boolean;
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label ?? color}
      aria-pressed={selected}
      title={label ?? color}
      className={cn(
        "h-7 w-7 rounded-full border border-black/10 transition-transform hover:scale-110",
        selected && "ring-2 ring-indigo-500 ring-offset-2"
      )}
      style={{ background: color }}
    />
  );
}

// 8개씩 한 줄로 보여주는 색상 격자
export function SwatchGrid({
  colors,
  value,
  onPick,
}: {
  colors: readonly string[];
  value: string;
  onPick: (color: string) => void;
}) {
  const current = value.trim().toLowerCase();
  return (
    <div className="grid grid-cols-8 justify-items-center gap-y-2.5">
      {colors.map((color) => (
        <Swatch
          key={color}
          color={color}
          selected={current === color.toLowerCase()}
          onClick={() => onPick(color)}
        />
      ))}
    </div>
  );
}

// 무지개 원(색상환) + HEX 입력. 어떤 색이든 직접 고를 수 있습니다.
export function CustomColor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [draft, setDraft] = useState(isHex(value) ? value : "");

  // 바깥에서 색이 바뀌면(팔레트 클릭 등) 입력칸도 맞춰줍니다. 지금 입력 중인 값과 같은 색이면 건드리지 않습니다.
  useEffect(() => {
    setDraft((prev) =>
      prev.toLowerCase() === value.toLowerCase() ? prev : isHex(value) ? value : ""
    );
  }, [value]);

  return (
    <div className="flex items-center gap-2">
      <label
        className="relative h-9 w-9 shrink-0 cursor-pointer overflow-hidden rounded-full border border-black/10 shadow-sm transition-transform hover:scale-105"
        style={{
          background:
            "conic-gradient(from 0deg, #f43f5e, #f59e0b, #eab308, #22c55e, #06b6d4, #6366f1, #d946ef, #f43f5e)",
        }}
        title="색상 직접 고르기"
      >
        <input
          type="color"
          value={toHex6(value)}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          aria-label="색상 직접 고르기"
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </label>
      <input
        value={draft}
        maxLength={7}
        spellCheck={false}
        placeholder="#000000"
        aria-label="HEX 색상 코드"
        onChange={(e) => {
          let next = e.target.value.trim();
          if (next && !next.startsWith("#")) next = "#" + next;
          setDraft(next);
          if (HEX6.test(next)) onChange(next.toUpperCase());
        }}
        className="h-9 min-w-0 flex-1 rounded-lg border border-line bg-white px-3 font-mono text-xs uppercase text-ink outline-none transition-colors placeholder:normal-case placeholder:text-ink/30 focus:border-indigo-500"
      />
    </div>
  );
}
