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
          canvas: "#f3f4f6",
          card: "#ffffff",
          ink: "#1a1a1a",
          muted: "#3e4c59",
          border: "#c9d1d9",
        },
        navy: {
          50: "#e8eef6",
          100: "#d4e0f0",
          200: "#a9c0de",
          700: "#1e407c",
          800: "#001e44",
          900: "#001433",
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
