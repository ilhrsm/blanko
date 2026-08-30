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
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        body: ["var(--font-manrope)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
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
