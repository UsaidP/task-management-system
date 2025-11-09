/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        //  Professional Minimal Palette

        // Light Mode - Clean & Airy
        light: {
          // Backgrounds
          bg: {
            primary: "#FFFFFF", // Pure white for main bg
            secondary: "#F8FAFC", // Slightly off-white for contrast
            tertiary: "#F1F5F9", // Subtle gray for cards
            hover: "#E2E8F0", // Hover states
          },
          // Text
          text: {
            primary: "#0F172A", // Rich black for headings
            secondary: "#475569", // Medium gray for body
            tertiary: "#94A3B8", // Light gray for hints
            inverse: "#FFFFFF", // White text on dark bg
          },
          // Borders
          border: {
            DEFAULT: "#E2E8F0", // Soft borders
            strong: "#CBD5E1", // Stronger dividers
            focus: "#3B82F6", // Focus rings
          },
        },

        // Dark Mode - Deep & Sophisticated
        dark: {
          // Backgrounds
          bg: {
            primary: "#0A0E1A", // Deep navy base
            secondary: "#131720", // Slightly lighter navy
            tertiary: "#1A2030", // Card backgrounds
            hover: "#232938", // Hover states
          },
          // Text
          text: {
            primary: "#F8FAFC", // Almost white for headings
            secondary: "#CBD5E1", // Soft gray for body
            tertiary: "#94A3B8", // Muted for hints
            inverse: "#0F172A", // Dark text on light bg
          },
          // Borders
          border: {
            DEFAULT: "#1E293B", // Subtle borders
            strong: "#334155", // Stronger dividers
            focus: "#60A5FA", // Focus rings
          },
        },

        //  Accent Colors - Vibrant but Professional
        accent: {
          // Primary - Blue (Trust, Productivity)
          primary: {
            light: "#3B82F6", // Bright blue
            DEFAULT: "#2563EB", // Standard blue
            dark: "#1D4ED8", // Deep blue
          },
          // Success - Green (Completion, Growth)
          success: {
            light: "#10B981", // Fresh green
            DEFAULT: "#059669", // Rich green
            dark: "#047857", // Deep green
          },
          // Warning - Amber (Medium Priority, Attention)
          warning: {
            light: "#F59E0B", // Bright amber
            DEFAULT: "#D97706", // Rich amber
            dark: "#B45309", // Deep amber
          },
          // Danger - Red (High Priority, Urgent)
          danger: {
            light: "#EF4444", // Bright red
            DEFAULT: "#DC2626", // Rich red
            dark: "#B91C1C", // Deep red
          },
          // Info - Cyan (Low Priority, Information)
          info: {
            light: "#06B6D4", // Bright cyan
            DEFAULT: "#0891B2", // Rich cyan
            dark: "#0E7490", // Deep cyan
          },
          // Purple - Special/Premium features
          purple: {
            light: "#A855F7", // Bright purple
            DEFAULT: "#9333EA", // Rich purple
            dark: "#7E22CE", // Deep purple
          },
        },

        // 📋 Task Status Colors (Semantic)
        task: {
          // Priority levels
          priority: {
            urgent: "#DC2626", // Critical tasks
            high: "#EF4444", // High priority
            medium: "#F59E0B", // Medium priority
            low: "#0891B2", // Low priority
            none: "#94A3B8", // No priority
          },
          // Status indicators
          status: {
            todo: "#64748B", // Not started
            progress: "#3B82F6", // In progress
            review: "#A855F7", // Under review
            done: "#10B981", // Completed
            blocked: "#DC2626", // Blocked
          },
        },

        // 🎭 Utility Colors
        utility: {
          overlay: "rgba(15, 23, 42, 0.5)", // Modal overlays
          "overlay-dark": "rgba(0, 0, 0, 0.7)", // Dark mode overlays
          divider: "#E5E7EB", // Subtle dividers
          "divider-dark": "#1E293B", // Dark dividers
        },
      },

      boxShadow: {
        // Light mode shadows - Soft & Subtle
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        DEFAULT: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",

        // Dark mode shadows - Deeper
        "dark-sm": "0 1px 2px 0 rgba(0, 0, 0, 0.3)",
        "dark-md": "0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3)",
        "dark-lg": "0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.4)",

        // Special effects
        glow: "0 0 20px rgba(59, 130, 246, 0.4)",
        "glow-success": "0 0 20px rgba(16, 185, 129, 0.4)",
        "glow-danger": "0 0 20px rgba(220, 38, 38, 0.4)",

        // Focus states
        focus: "0 0 0 3px rgba(59, 130, 246, 0.1)",
        "focus-dark": "0 0 0 3px rgba(96, 165, 250, 0.2)",
      },

      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "Consolas", "monospace"],
      },

      fontSize: {
        // Professional type scale
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
      },

      spacing: {
        // Consistent spacing scale
        18: "4.5rem",
        88: "22rem",
      },

      borderRadius: {
        // Modern, slightly rounded
        sm: "0.25rem",
        DEFAULT: "0.5rem",
        md: "0.625rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.25rem",
      },

      transitionDuration: {
        // Smooth, professional animations
        DEFAULT: "200ms",
        fast: "150ms",
        slow: "300ms",
      },

      animation: {
        "fade-in": "fadeIn 0.2s ease-in",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
      },

      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
}
