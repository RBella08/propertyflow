import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";
import forms from "@tailwindcss/forms";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1440px",
      },
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563EB",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#0F172A",
          foreground: "#FFFFFF",
        },
        success: {
          DEFAULT: "#16A34A",
          foreground: "#FFFFFF",
        },
        warning: {
          DEFAULT: "#F59E0B",
          foreground: "#0F172A",
        },
        danger: {
          DEFAULT: "#DC2626",
          foreground: "#FFFFFF",
        },
        info: {
          DEFAULT: "#0EA5E9",
          foreground: "#FFFFFF",
        },
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "16px",
        xl: "20px",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgb(0 0 0 / 0.05)",
        dropdown: "0 4px 6px rgb(0 0 0 / 0.1)",
        modal: "0 20px 25px rgb(0 0 0 / 0.1)",
      },
    },
  },
  plugins: [
    typography,
    forms,
    animate,
  ],
};

export default config;