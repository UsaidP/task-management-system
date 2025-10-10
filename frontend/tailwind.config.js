/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
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
        // --- ADDED COLORS ---
        error: "#F85149", // A suitable red for errors/high priority
        urgent: "#E36209", // A strong orange for urgent priority
      },
      boxShadow: {
        glow: "0 0 15px rgba(88, 166, 255, 0.5)",
        card: "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)",
        "card-hover":
          "0 20px 25px -5px rgba(88, 166, 255, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)",
      },
    },
  },
  plugins: [],
}
