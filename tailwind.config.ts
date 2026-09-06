import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#101B2D",
          50: "#EEF1F6",
          100: "#D6DCE8",
          200: "#AEB9D0",
          300: "#8695B5",
          400: "#5E729A",
          500: "#3A4E71",
          600: "#233657",
          700: "#152238",
          800: "#101B2D",
          900: "#0A121F",
        },
        brass: {
          DEFAULT: "#B8863B",
          50: "#FBF3E7",
          100: "#F3E1C1",
          200: "#E7C892",
          300: "#DBAF63",
          400: "#CB9948",
          500: "#B8863B",
          600: "#946A2E",
          700: "#6F4F22",
        },
        paper: "#FAF9F6",
        ledger: "#E7E4DC",
        slate: {
          ink: "#2B2E33",
        },
      },
      fontFamily: {
        serif: ["var(--font-source-serif)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "Helvetica", "Arial", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 27, 45, 0.06), 0 1px 1px rgba(16, 27, 45, 0.04)",
      },
    },
  },
  plugins: [],
};
export default config;
