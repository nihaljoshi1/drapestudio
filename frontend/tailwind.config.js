/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ivory:    "#F7F5F2",
        chalk:    "#EEEAE3",
        stone:    "#D6D0C4",
        slate:    "#8C8880",
        espresso: "#2E2B26",
        void:     "#0D0D0D",
        gold:     "#C9A96E",
        crimson:  "#E8315A",
      },
      fontFamily: {
        display: ["Playfair Display", "Georgia", "serif"],
        body:    ["Outfit", "system-ui", "sans-serif"],
        mono:    ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        btn:   "2px",
        card:  "8px",
        input: "4px",
        pill:  "100px",
      },
      spacing: {
        // 4px base scale from PRD
        1: "4px", 2: "8px", 3: "12px", 4: "16px",
        6: "24px", 8: "32px", 12: "48px", 16: "64px",
        24: "96px", 32: "128px",
      },
    },
  },
  plugins: [],
}