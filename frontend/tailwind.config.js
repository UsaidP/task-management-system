/** @type {import('tailwindcss').Config} */
import tailwindcssAnimate from "tailwindcss-animate"

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // ─── Core Accents ─────────────────────────
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        success: "rgb(var(--color-success) / <alpha-value>)",
        warning: "rgb(var(--color-warning) / <alpha-value>)",
        danger: "rgb(var(--color-danger) / <alpha-value>)",
        info: "rgb(var(--color-info) / <alpha-value>)",

        // ─── Surfaces ─────────────────────────────
        bg: {
          canvas: "rgb(var(--bg-canvas) / <alpha-value>)",
          surface: "rgb(var(--bg-surface) / <alpha-value>)",
          elevated: "rgb(var(--bg-elevated) / <alpha-value>)",
          hover: "rgb(var(--bg-hover) / <alpha-value>)",
        },

        // ─── Typography ───────────────────────────
        text: {
          primary: "rgb(var(--text-primary) / <alpha-value>)",
          secondary: "rgb(var(--text-secondary) / <alpha-value>)",
          muted: "rgb(var(--text-muted) / <alpha-value>)",
          inverse: "rgb(var(--text-inverse) / <alpha-value>)",
        },

        // ─── Borders ──────────────────────────────
        border: {
          DEFAULT: "rgb(var(--border-default) / <alpha-value>)",
          strong: "rgb(var(--border-strong) / <alpha-value>)",
          focus: "rgb(var(--border-focus) / <alpha-value>)",
        },

        // ─── Accent Primary + Danger (legacy aliases) ────
        accent: {
          primary: "rgb(var(--color-accent-primary) / <alpha-value>)",
          danger: "rgb(var(--color-danger) / <alpha-value>)",
          "danger-dark": "rgb(168 50 50 / <alpha-value>)",
        },

        // ─── Legacy Light/Dark Token Aliases ─────────────
        "light-bg": {
          primary: "rgb(var(--light-bg-primary) / <alpha-value>)",
          secondary: "rgb(var(--light-bg-secondary) / <alpha-value>)",
          tertiary: "rgb(var(--light-bg-tertiary) / <alpha-value>)",
        },
        "light-text": {
          primary: "rgb(var(--light-text-primary) / <alpha-value>)",
          secondary: "rgb(var(--light-text-secondary) / <alpha-value>)",
          tertiary: "rgb(var(--light-text-tertiary) / <alpha-value>)",
        },
        "light-border": "rgb(var(--light-border) / <alpha-value>)",
        "light-border-strong": "rgb(var(--light-border-strong) / <alpha-value>)",
        "dark-bg": {
          primary: "rgb(var(--dark-bg-primary) / <alpha-value>)",
          secondary: "rgb(var(--dark-bg-secondary) / <alpha-value>)",
          tertiary: "rgb(var(--dark-bg-tertiary) / <alpha-value>)",
        },
        "dark-text": {
          primary: "rgb(var(--dark-text-primary) / <alpha-value>)",
          secondary: "rgb(var(--dark-text-secondary) / <alpha-value>)",
          tertiary: "rgb(var(--dark-text-tertiary) / <alpha-value>)",
        },
        "dark-border": "rgb(var(--dark-border) / <alpha-value>)",
        "dark-border-strong": "rgb(var(--dark-border-strong) / <alpha-value>)",

        // ─── Task-Specific (Semantic Aliases) ─────
        task: {
          priority: {
            urgent: "rgb(var(--color-danger) / <alpha-value>)",
            high: "rgb(224 107 107 / <alpha-value>)",
            medium: "rgb(var(--color-warning) / <alpha-value>)",
            low: "rgb(var(--color-info) / <alpha-value>)",
            none: "rgb(var(--text-muted) / <alpha-value>)",
          },
          status: {
            todo: "rgb(var(--text-muted) / <alpha-value>)",
            progress: "rgb(var(--color-primary) / <alpha-value>)",
            review: "rgb(var(--color-warning) / <alpha-value>)",
            done: "rgb(var(--color-success) / <alpha-value>)",
            blocked: "rgb(var(--color-danger) / <alpha-value>)",
          },
        },
      },

      boxShadow: {
        sm: "0 1px 2px rgb(46 26 5 / 0.05)",
        DEFAULT: "0 1px 3px rgb(46 26 5 / 0.08), 0 1px 2px rgb(46 26 5 / 0.06)",
        md: "0 4px 6px rgb(46 26 5 / 0.08), 0 2px 4px rgb(46 26 5 / 0.05)",
        lg: "0 10px 15px rgb(46 26 5 / 0.08), 0 4px 6px rgb(46 26 5 / 0.04)",
        glow: "0 0 16px rgb(196 101 74 / 0.3)",
        focus: "0 0 0 3px rgb(196 101 74 / 0.15)",
        // Legacy shadow aliases
        card: "0 2px 8px rgb(46 26 5 / 0.08), 0 1px 3px rgb(46 26 5 / 0.05)",
        "card-hover": "0 8px 24px rgb(46 26 5 / 0.12), 0 2px 8px rgb(46 26 5 / 0.06)",
        "card-dark": "0 2px 8px rgb(0 0 0 / 0.3), 0 1px 3px rgb(0 0 0 / 0.2)",
        "card-dark-hover": "0 8px 24px rgb(0 0 0 / 0.4), 0 2px 8px rgb(0 0 0 / 0.25)",
        "dark-sm": "0 1px 2px rgb(0 0 0 / 0.3)",
        "dark-md": "0 4px 6px rgb(0 0 0 / 0.3), 0 2px 4px rgb(0 0 0 / 0.2)",
      },

      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        pulse: "pulseSoft 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        slideUp: {
          "0%": { opacity: 0, transform: "translateY(8px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: 0, transform: "scale(0.95)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
        pulseSoft: { "0%, 100%": { opacity: 1 }, "50%": { opacity: 0.6 } },
      },

      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
        serif: ["DM Serif Display", "Georgia", "serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: { "4xl": "2rem" },
    },
  },
  plugins: [tailwindcssAnimate],
}
