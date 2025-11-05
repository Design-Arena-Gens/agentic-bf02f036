import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mcd: {
          red: "#DA291C",
          yellow: "#FFC72C",
          gold: "#FFC72C",
          dark: "#27251F"
        }
      }
    },
  },
  plugins: [],
} satisfies Config;
