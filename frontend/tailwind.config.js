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
            tertiary: "#6B5D52", // Warm gray — hints, placeholders
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
            secondary: "#D4C8B8", // Warm gray for body
            tertiary: "#A89B8E", // Muted for hints
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
        xs: "0 1px 2px 0 rgba(44, 36, 32, 0.04)",
        sm: "0 1px 2px 0 rgba(44, 36, 32, 0.05)",
        DEFAULT: "0 1px 3px 0 rgba(44, 36, 32, 0.08), 0 1px 2px -1px rgba(44, 36, 32, 0.06)",
        md: "0 4px 6px -1px rgba(44, 36, 32, 0.08), 0 2px 4px -2px rgba(44, 36, 32, 0.05)",
        lg: "0 10px 15px -3px rgba(44, 36, 32, 0.08), 0 4px 6px -4px rgba(44, 36, 32, 0.04)",
        xl: "0 20px 25px -5px rgba(44, 36, 32, 0.10), 0 8px 10px -6px rgba(44, 36, 32, 0.06)",
        "2xl": "0 25px 50px -12px rgba(44, 36, 32, 0.15)",

        // Dark mode shadows
        "dark-xs": "0 1px 2px 0 rgba(0, 0, 0, 0.2)",
        "dark-sm": "0 1px 2px 0 rgba(0, 0, 0, 0.25)",
        "dark-md": "0 4px 6px -1px rgba(0, 0, 0, 0.35), 0 2px 4px -2px rgba(0, 0, 0, 0.25)",
        "dark-lg": "0 10px 15px -3px rgba(0, 0, 0, 0.45), 0 4px 6px -4px rgba(0, 0, 0, 0.35)",
        "dark-xl": "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4)",

        // Special effects — Warm glows
        glow: "0 0 20px rgba(196, 101, 74, 0.3)", // Terracotta glow
        "glow-sm": "0 0 10px rgba(196, 101, 74, 0.2)",
        "glow-success": "0 0 20px rgba(122, 154, 109, 0.3)", // Sage glow
        "glow-danger": "0 0 20px rgba(196, 74, 74, 0.3)", // Warm red glow
        "glow-info": "0 0 20px rgba(104, 136, 160, 0.3)", // Info glow

        // Card interactive states
        "card-hover":
          "0 8px 25px -5px rgba(44, 36, 32, 0.12), 0 4px 10px -3px rgba(44, 36, 32, 0.06)",
        "card-active":
          "0 2px 8px -2px rgba(44, 36, 32, 0.1), inset 0 1px 2px rgba(44, 36, 32, 0.06)",
        "card-dark-hover":
          "0 8px 25px -5px rgba(0, 0, 0, 0.35), 0 4px 10px -3px rgba(0, 0, 0, 0.25)",

        // Focus states — Terracotta
        focus: "0 0 0 3px rgba(196, 101, 74, 0.15)",
        "focus-dark": "0 0 0 3px rgba(196, 101, 74, 0.25)",
        "focus-ring": "0 0 0 2px rgba(196, 101, 74, 0.4)",

        // Inner shadow for pressed states
        inner: "inset 0 2px 4px 0 rgba(44, 36, 32, 0.06)",
      },

      fontFamily: {
        serif: ["Lora", "Georgia", "Cambria", "serif"],
        sans: ["DM Sans", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "Consolas", "monospace"],
        display: ["Lora", "Georgia", "serif"],
      },

      fontSize: {
        // Professional type scale + display size
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1.2" }],
        "6xl": ["3.75rem", { lineHeight: "1.1" }],
      },

      spacing: {
        18: "4.5rem",
        88: "22rem",
        100: "25rem",
        112: "28rem",
        128: "32rem",
      },

      borderRadius: {
        "4xl": "2rem",
      },

      transitionDuration: {
        DEFAULT: "200ms",
        fast: "150ms",
        normal: "200ms",
        slow: "300ms",
        slower: "400ms",
      },

      transitionTimingFunction: {
        DEFAULT: "cubic-bezier(0.25, 0.1, 0.25, 1)",
        "ease-out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "ease-in-expo": "cubic-bezier(0.7, 0, 0.84, 0)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      },

      // ═══════════════════════════════════════════
      // ✨ Micro-Interaction Animations
      // ═══════════════════════════════════════════
      animation: {
        // Entrance animations
        "fade-in": "fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-in-up": "fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-in-down": "fadeInDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-in-scale": "fadeInScale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "scale-in": "scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-in-left": "slideInLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-up": "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-down": "slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-in-right": "slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-out-right": "slideOutRight 0.2s cubic-bezier(0.7, 0, 0.84, 0)",

        // Attention animations
        "pulse-soft": "pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shake: "shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97)",
        "bounce-subtle": "bounceSubtle 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",

        // Loading animations
        shimmer: "shimmer 2s linear infinite",
        "spin-slow": "spin 3s linear infinite",

        // Interaction feedback
        press: "press 0.15s cubic-bezier(0.25, 0.1, 0.25, 1)",
        lift: "lift 0.2s cubic-bezier(0.16, 1, 0.3, 1)",

        // Stagger entrance (for lists)
        "stagger-in": "staggerIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",

        // Success feedback
        checkmark: "checkmark 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        confetti: "confetti 0.6s cubic-bezier(0.16, 1, 0.3, 1)",

        // Floating elements
        float: "float 6s ease-in-out infinite",
        "float-delayed": "float 6s ease-in-out 2s infinite",
      },

      keyframes: {
        // Entrance
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInDown: {
          "0%": { opacity: "0", transform: "translateY(-12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInScale: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
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

        // Attention
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-2px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(2px)" },
        },
        bounceSubtle: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)" },
        },

        // Loading
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },

        // Interaction
        press: {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(0.97)" },
        },
        lift: {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.02)" },
        },

        // Stagger
        staggerIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },

        // Success
        checkmark: {
          "0%": { transform: "scale(0) rotate(-45deg)", opacity: "0" },
          "50%": { transform: "scale(1.2) rotate(0deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(0deg)", opacity: "1" },
        },
        confetti: {
          "0%": { transform: "scale(0)", opacity: "0" },
          "50%": { transform: "scale(1.3)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },

        // Floating
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },

      // ═══════════════════════════════════════════
      // 📐 Backdrop & Effects
      // ═══════════════════════════════════════════
      backdropBlur: {
        xs: "2px",
      },

      backgroundImage: {
        "shimmer-gradient":
          "linear-gradient(90deg, transparent 0%, rgba(196, 101, 74, 0.04) 50%, transparent 100%)",
        "shimmer-dark-gradient":
          "linear-gradient(90deg, transparent 0%, rgba(196, 101, 74, 0.06) 50%, transparent 100%)",
      },

      backgroundSize: {
        "200%": "200% 100%",
      },
    },
  },
  plugins: [],
}
