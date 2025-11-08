/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/index.html", "./src/**/*.{html,js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        airose: {
          dark: "#0f0f10",
          surface: "#1a1a1c",
          surface2: "#232326",
          text: "#f3f4f6",
          dim: "#a1a1aa",
          accent: "#ec4899",
          accentHover: "#f472b6",
          violet: "#c084fc",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Poppins", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 20px rgba(0,0,0,0.35)",
        hard: "0 10px 40px rgba(0,0,0,0.45)",
      },
    },
  },
  plugins: [require("@tailwindcss/line-clamp")], // ✅ Added
};
