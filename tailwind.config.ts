import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#FAF8F4",
        surface: "#FFFFFF",
        ink: "#262220",
        line: "#E7E1D7",
        muted: "#867B6E",
        accent: {
          DEFAULT: "#B2532F",
          dark: "#8F3F22",
          light: "#D99364",
        },
      },
      fontFamily: {
        // 시스템 산세리프 + 한글 폰트 폴백. display/body 구분 없이 동일 폰트를 사용합니다.
        display: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "Apple SD Gothic Neo",
          "Pretendard Variable",
          "Malgun Gothic",
          "sans-serif",
        ],
        body: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Text",
          "Apple SD Gothic Neo",
          "Pretendard Variable",
          "Malgun Gothic",
          "sans-serif",
        ],
        mono: ["ui-monospace", "SF Mono", "Menlo", "monospace"],
      },
      maxWidth: {
        content: "1280px",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "scale(0.98)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 500ms ease-out both",
        fadeUp: "fadeUp 500ms ease-out both",
      },
    },
  },
  plugins: [],
};
export default config;
