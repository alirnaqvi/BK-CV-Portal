import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Deep green: brand colour, dark surfaces, primary actions.
        pine: {
          50: "#EEF5F1",
          100: "#DAE9E1",
          200: "#B5D2C4",
          300: "#86B4A0",
          400: "#4F907A",
          500: "#22705A",
          600: "#155947",
          700: "#0F4639",
          800: "#0B362D",
          900: "#07261F",
        },
        // Warm yellow: the "on file" stamp, highlights, the main call to action.
        marigold: {
          50: "#FFF8E6",
          100: "#FFEEC2",
          200: "#FFDE8A",
          300: "#FFCB52",
          400: "#FFB526",
          500: "#F09A0A",
          600: "#BD7404",
          700: "#8A5505",
        },
        mist: "#F2F6F3", // page background
        line: "#D9E3DD", // borders and dividers
        ink: "#13231F", // body text
        muted: "#51645D", // secondary text
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 0 rgba(11, 54, 45, 0.04), 0 10px 30px -12px rgba(11, 54, 45, 0.22)",
        lift: "0 24px 60px -24px rgba(7, 38, 31, 0.45)",
        bar: "0 -8px 30px -12px rgba(7, 38, 31, 0.35)",
      },
      keyframes: {
        stamp: {
          "0%": { opacity: "0", transform: "rotate(-11deg) scale(2.2)" },
          "60%": { opacity: "1", transform: "rotate(-11deg) scale(0.94)" },
          "100%": { opacity: "1", transform: "rotate(-11deg) scale(1)" },
        },
        "rise-in": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        stamp: "stamp 420ms cubic-bezier(0.2, 0.9, 0.3, 1.2) 650ms both",
        "rise-in": "rise-in 240ms ease-out both",
        "pop-in": "pop-in 160ms ease-out both",
      },
    },
  },
  plugins: [],
};
export default config;
