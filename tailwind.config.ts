import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0A0A0A",
        paper: "#F4F1E9",
        brand: "#D97706",
        lime: "#C7F464",
        sky: "#7CC4FF",
        pink: "#FF8FB1",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        brutal: "6px 6px 0 0 #0A0A0A",
        "brutal-lg": "10px 10px 0 0 #0A0A0A",
        "brutal-sm": "3px 3px 0 0 #0A0A0A",
      },
      borderWidth: { 3: "3px" },
    },
  },
  plugins: [],
};
export default config;
