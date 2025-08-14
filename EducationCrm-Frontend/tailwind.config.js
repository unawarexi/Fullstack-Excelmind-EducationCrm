/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class", // Dark mode toggle via class
  theme: {
    extend: {
      colors: {
        // Major theme colors
        primary: {
          50: "#f5f7fa",
          100: "#e4e9f1",
          200: "#c9d3e3",
          300: "#aebdd5",
          400: "#8399bb",
          500: "#5875a1", // Main grey-blue
          600: "#4d678f",
          700: "#3f5476",
          800: "#2a374f",
          900: "#151b27",
        },
        black: "#000000",
        white: "#ffffff",

        // Dark mode background + text
        dark: {
          bg: "#070b18", // main dark background
          surface: "#0e1527",
          text: "#e0e0e0",
        },

        // Status/indicator colors
        success: {
          light: "#d1fae5",
          DEFAULT: "#10b981",
          dark: "#047857",
        },
        warning: {
          light: "#fef3c7",
          DEFAULT: "#f59e0b",
          dark: "#b45309",
        },
        error: {
          light: "#fee2e2",
          DEFAULT: "#ef4444",
          dark: "#991b1b",
        },
        info: {
          light: "#e0f2fe",
          DEFAULT: "#3b82f6",
          dark: "#1e40af",
        },
      },
    },
  },
  plugins: [],
};
