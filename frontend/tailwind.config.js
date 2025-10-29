/** @type {import('tailwindcss').Config} */
export default {

  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // 🌞 Light Theme (default)
        white: "#FFFFFF",
        "slate-50": "#F8FAFC",
        "slate-100": "#F1F5F9",
        "slate-200": "#E2E8F0",
        "slate-300": "#CBD5E1",
        "slate-500": "#64748B",
        "slate-700": "#334155",
        "slate-900": "#0F172A",

        "ocean-blue": "#0EA5E9",
        "deep-blue": "#0369A1",
        "light-blue": "#E0F2FE",
        "emerald-green": "#10B981",
        "amber-orange": "#F59E0B",
        "rose-red": "#EF4444",

        // task priorities
        "task-priority-high": "#EF4444",
        "task-priority-medium": "#F59E0B",
        "task-priority-low": "#0EA5E9",

        // Base tokens (light mode)
        primary: "#0EA5E9",
        border: "#E2E8F0",
        "text-primary": "#0F172A",
        "text-secondary": "#334155",
        "bg-primary": "#FFFFFF",
        "bg-secondary": "#F1F5F9",
      },

      // 🌙 Dark Mode Tokens (using CSS vars)
      textColor: {
        skin: {
          base: "var(--color-text-base)",
          secondary: "var(--color-text-secondary)",
        },
      },
      backgroundColor: {
        skin: {
          base: "var(--color-bg-base)",
          card: "var(--color-bg-card)",
          muted: "var(--color-bg-muted)",
        },
      },

      boxShadow: {
        glow: "0 0 25px rgba(14, 165, 233, 0.4)",
        card: "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)",
        "card-hover": "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
