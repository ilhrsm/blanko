"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface EditableTextProps {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  as?: "input" | "textarea";
  rows?: number;
  className?: string;
  editable?: boolean;
}

// 편집 모드일 때는 실제 쇼핑몰 화면 위에서 바로 입력할 수 있는 input/textarea로,
// 편집 모드가 아닐 때는 평범한 텍스트로 렌더링됩니다.
// 편집 가능 영역이라는 걸 은은하게 알려주기 위해 hover/focus 시에만 점선 테두리가 보입니다.
export function EditableText({
  value,
  onChange,
  placeholder,
  as = "input",
  rows = 2,
  className,
  editable,
}: EditableTextProps) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  if (!editable) {
    if (!value) return null;
    return <span className={className}>{value}</span>;
  }

  const shared = cn(
    "w-full resize-none border-0 bg-transparent p-1 -m-1 outline-none",
    "rounded-sm outline-offset-4 outline-dashed outline-1 outline-transparent",
    "transition-[outline-color] hover:outline-current/30 focus:outline-current/60",
    "placeholder:opacity-40",
    className
  );

  if (as === "textarea") {
    return (
      <textarea
        rows={rows}
        value={draft}
        placeholder={placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => draft !== value && onChange?.(draft)}
        className={shared}
      />
    );
  }

  return (
    <input
      value={draft}
      placeholder={placeholder}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => draft !== value && onChange?.(draft)}
      className={shared}
    />
  );
}
