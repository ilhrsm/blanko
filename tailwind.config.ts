import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#FFFFFF",
        surface: "#FFFFFF",
        ink: "#171717",
        line: "#E2E2E2",
        muted: "#6E6E73",
        accent: {
          DEFAULT: "#171717",
          dark: "#000000",
          light: "#6E6E73",
        },
      },
      fontFamily: {
        // 애플 시스템 폰트(SF Pro) 계열의 깔끔한 산세리프. display/body 구분 없이 동일 폰트를 사용합니다.
        display: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        body: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Text",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: ["ui-monospace", "SF Mono", "Menlo", "monospace"],
      },
      maxWidth: {
        content: "1280px",
      },
      transitionTimingFunction: {
        iris: "cubic-bezier(0.6, 0.05, 0.15, 0.95)",
      },
      keyframes: {
        iris: {
          "0%": { clipPath: "circle(0% at 50% 50%)" },
          "100%": { clipPath: "circle(75% at 50% 50%)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        iris: "iris 900ms cubic-bezier(0.6,0.05,0.15,0.95) both",
        fadeUp: "fadeUp 500ms ease-out both",
      },
    },
  },
  plugins: [],
};
export default config;
