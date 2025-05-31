import daisyui from "daisyui";
import type { Config } from "tailwindcss";

// Extend the Config type to include daisyui configuration
interface CustomConfig extends Config {
  daisyui?: {
    themes?: string[];
  };
}

const config: CustomConfig = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        progress: {
          "0%": { width: "0%" },
          "50%": { width: "70%" },
          "100%": { width: "100%" },
        },
      },
      animation: {
        progress: "progress 2s ease-in-out infinite",
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: ["light", "dark"],
  },
};

export default config;
