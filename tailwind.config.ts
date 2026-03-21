import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f7ff",
          100: "#e0effe",
          600: "#2563eb",
          700: "#1d4ed8",
          900: "#1e3a5f",
        },
        student: {
          canvas: "#eef2f6",
          card: "#ffffff",
          ink: "#1a2e3d",
          muted: "#5a6d7d",
          border: "#dfe6ee",
        },
      },
      boxShadow: {
        student: "0 1px 3px rgba(26, 46, 61, 0.06), 0 0 0 1px rgba(26, 46, 61, 0.04)",
      },
    },
  },
  plugins: [],
};
export default config;
