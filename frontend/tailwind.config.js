/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // ═══════════════════════════════════════════
        // 🎨 TaskFlow — Warm Earth-Tone Palette
        // "Work that feels human"
        // ═══════════════════════════════════════════

        // Light Mode — Warm & Organic
        light: {
          bg: {
            primary: "#FAF6F1", // Linen — main background
            secondary: "#F5EDE3", // Warm off-white — cards, surfaces
            tertiary: "#F0E6D6", // Sand — secondary surfaces
            hover: "#E8DED0", // Warm hover state
          },
          text: {
            primary: "#2C2420", // Espresso — headings, strong text
            secondary: "#4A3C30", // Earth — body text (improved contrast)
            tertiary: "#6B5D52", // Warm gray — hints, placeholders (WCAG AA compliant - improved from #5A4D42)
            inverse: "#FAF6F1", // Linen — text on dark bg
          },
          border: {
            DEFAULT: "#E0D5C7", // Warm sand border
            strong: "#C9BAA8", // Stronger divider
            focus: "#C4654A", // Terracotta focus ring
          },
        },

        // Dark Mode — Warm Charcoal (not pure black)
        dark: {
          bg: {
            primary: "#1A1614", // Warm charcoal — main background
            secondary: "#231F1C", // Slightly lighter warm dark
            tertiary: "#2C2723", // Card backgrounds
            hover: "#363028", // Hover states
          },
          text: {
            primary: "#F5EDE3", // Warm white for headings
            secondary: "#D4C8B8", // Warm gray for body (improved contrast from #C9BAA8)
            tertiary: "#A89B8E", // Muted for hints (improved contrast from #8B8178)
            inverse: "#1A1614", // Dark text on light bg
          },
          border: {
            DEFAULT: "#2C2723", // Subtle warm borders
            strong: "#3D3530", // Stronger dividers
            focus: "#C4654A", // Terracotta focus ring (dark mode)
          },
        },

        // Accent Colors — Warm & Purposeful
        accent: {
          // Primary — Terracotta (Action, CTA)
          primary: {
            light: "#D4856A", // Lighter terracotta
            DEFAULT: "#C4654A", // Terracotta
            dark: "#A8503A", // Deep terracotta
          },
          // Secondary — Blush (Soft highlights)
          secondary: {
            light: "#F0D4CA", // Light blush
            DEFAULT: "#E8C4B8", // Blush
            dark: "#D4A898", // Deep blush
          },
          // Success — Sage (Done, Growth)
          success: {
            light: "#9AB88D", // Light sage
            DEFAULT: "#7A9A6D", // Sage
            dark: "#5E7D52", // Deep sage
          },
          // Warning — Ochre (Attention)
          warning: {
            light: "#E4C068", // Light ochre
            DEFAULT: "#D4A548", // Ochre
            dark: "#B88A30", // Deep ochre
          },
          // Danger — Warm Red (Urgent, Error)
          danger: {
            light: "#D46A6A", // Light warm red
            DEFAULT: "#C44A4A", // Warm red
            dark: "#A83030", // Deep warm red
          },
          // Info — Dusty Blue (Information)
          info: {
            light: "#88A8C0", // Light dusty blue
            DEFAULT: "#6888A0", // Dusty blue
            dark: "#4A6A82", // Deep dusty blue
          },
          // Aliases for gradient targets
          "info-dark": "#4A6A82",
          "success-dark": "#5E7D52",
          // Purple — Muted (Labels, categories)
          purple: {
            light: "#AB90C0", // Light muted purple
            DEFAULT: "#8B70A0", // Muted purple
            dark: "#6E5482", // Deep muted purple
          },
        },

        // Task Status Colors (Semantic — warm variants)
        task: {
          priority: {
            urgent: "#C44A4A", // Warm red
            high: "#D45A5A", // Lighter warm red
            medium: "#D4A548", // Ochre
            low: "#6888A0", // Dusty blue
            none: "#8B8178", // Warm gray
          },
          status: {
            todo: "#8B8178", // Warm gray
            progress: "#C4654A", // Terracotta
            review: "#D4A548", // Ochre
            done: "#7A9A6D", // Sage
            blocked: "#C44A4A", // Warm red
          },
        },

        // Utility Colors
        utility: {
          overlay: "rgba(26, 22, 20, 0.6)", // Warm overlay for modal backdrops
          "overlay-dark": "rgba(0, 0, 0, 0.7)", // Dark overlay for modal backdrops
          divider: "#E0D5C7", // Warm divider
          "divider-dark": "#2C2723", // Dark warm divider
        },
      },

      boxShadow: {
        // Light mode — Warm shadows (not pure black)
        sm: "0 1px 2px 0 rgba(44, 36, 32, 0.05)",
        DEFAULT: "0 1px 3px 0 rgba(44, 36, 32, 0.08), 0 1px 2px -1px rgba(44, 36, 32, 0.06)",
        md: "0 4px 6px -1px rgba(44, 36, 32, 0.08), 0 2px 4px -2px rgba(44, 36, 32, 0.05)",
        lg: "0 10px 15px -3px rgba(44, 36, 32, 0.08), 0 4px 6px -4px rgba(44, 36, 32, 0.04)",
        xl: "0 20px 25px -5px rgba(44, 36, 32, 0.10), 0 8px 10px -6px rgba(44, 36, 32, 0.06)",

        // Dark mode shadows
        "dark-sm": "0 1px 2px 0 rgba(0, 0, 0, 0.25)",
        "dark-md": "0 4px 6px -1px rgba(0, 0, 0, 0.35), 0 2px 4px -2px rgba(0, 0, 0, 0.25)",
        "dark-lg": "0 10px 15px -3px rgba(0, 0, 0, 0.45), 0 4px 6px -4px rgba(0, 0, 0, 0.35)",

        // Special effects — Warm glows
        glow: "0 0 20px rgba(196, 101, 74, 0.3)", // Terracotta glow
        "glow-success": "0 0 20px rgba(122, 154, 109, 0.3)", // Sage glow
        "glow-danger": "0 0 20px rgba(196, 74, 74, 0.3)", // Warm red glow

        // Focus states — Terracotta
        focus: "0 0 0 3px rgba(196, 101, 74, 0.15)",
        "focus-dark": "0 0 0 3px rgba(196, 101, 74, 0.25)",
      },

      fontFamily: {
        serif: ["Lora", "Georgia", "Cambria", "serif"],
        sans: ["DM Sans", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "Consolas", "monospace"],
      },

      fontSize: {
        // Professional type scale + display size
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }], // Display size
      },

      spacing: {
        18: "4.5rem",
        88: "22rem",
      },

      borderRadius: {
        // Organic, soft rounded
        sm: "0.25rem",
        DEFAULT: "0.5rem", // 8px — default
        md: "0.625rem",
        lg: "0.75rem", // 12px — cards
        xl: "1rem", // 16px — modals
        "2xl": "1.25rem",
      },

      transitionDuration: {
        DEFAULT: "200ms",
        fast: "150ms",
        slow: "300ms",
      },

      transitionTimingFunction: {
        DEFAULT: "ease-out",
      },

      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "slide-in-left": "slideInLeft 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "slide-out-right": "slideOutRight 0.2s ease-in",
      },

      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        slideInLeft: {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideInRight: {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideOutRight: {
          "0%": { transform: "translateX(0)", opacity: "1" },
          "100%": { transform: "translateX(100%)", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
}
