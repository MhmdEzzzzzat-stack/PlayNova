import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        nova: {
          950: "#090817",
          900: "#100e24",
          800: "#1b1735",
          700: "#29214d",
          500: "#8b5cf6",
          400: "#a78bfa",
          300: "#c4b5fd",
        },
      },
      boxShadow: {
        glow: "0 0 40px rgba(139, 92, 246, 0.2)",
      },
    },
  },
  plugins: [],
};

export default config;
