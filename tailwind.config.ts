import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Rebrand-friendly tokens: change these to restyle the whole app.
        brand: {
          navy: "#16233d",
          navylight: "#233752",
          charcoal: "#2b3440",
          sun: "#f6b40e",
          sunlight: "#fcd34d",
          green: "#3e8e5a",
          greenlight: "#e8f3ec",
          cream: "#fbf9f4",
        },
      },
      boxShadow: {
        card: "0 1px 3px rgba(22,35,61,0.08), 0 4px 16px rgba(22,35,61,0.06)",
      },
    },
  },
  plugins: [],
};
export default config;
