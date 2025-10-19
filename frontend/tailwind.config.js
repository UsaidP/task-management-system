/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // MERGED COLOR PALETTE: Supports both old and new components
      colors: {
        // --- OLD THEME COLORS (PRESERVED FOR BACKWARD COMPATIBILITY) ---
        background: "#0D1117",
        primary: "#435165",
        secondary: "#21262D",
        accent: "#58A6FF",
        "text-primary": "#d7ebff",
        "text-secondary": "#8B949E",
        surface: "#161B22",
        border: "#30363D",
        "surface-light": "#21262D",
        "border-light": "#4A5568",
        "primary-dark": "#0D1117",
        "text-muted": "#8B949E",
        "text-review": "#007BFF",
        warning: "#F5A623",
        success: "#28A745",
        error: "#F85149",
        urgent: "#E36209",

        // --- NEW THEME COLORS (FOR THE NEW LANDING PAGE) ---
        "bento-background": "#050505",
        "bento-surface": "#111111",
        "bento-border": "#222222",
        "bento-text-primary": "#F5F5F7",
        "bento-text-secondary": "#A1A1A6",
        "accent-start": "#6A5AF9",
        "accent-end": "#D669ED",
      },
      // MERGED BOX SHADOWS
      boxShadow: {
        // Old Theme Shadows
        glow: "0 0 15px rgba(88, 166, 255, 0.5)",
        card: "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)",
        "card-hover":
          "0 20px 25px -5px rgba(88, 166, 255, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)",
        // New Theme Shadows
        "bento-card": "0px 0px 0px 1px #222222",
        "bento-card-hover": "0px 0px 0px 1px #6A5AF9",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      backgroundImage: {
        // New Theme Gradient
        "gradient-accent": "linear-gradient(90deg, #6A5AF9, #D669ED)",
      },
    },
  },
  plugins: [],
}
