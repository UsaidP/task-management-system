/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'ocean-blue': '#0EA5E9',
        'deep-blue': '#0369A1',
        'light-blue': '#E0F2FE',
        'emerald-green': '#10B981',
        'amber-orange': '#F59E0B',
        'rose-red': '#EF4444',
        'slate-900': '#0F172A',
        'slate-700': '#334155',
        'slate-500': '#64748B',
        'slate-200': '#E2E8F0',
        'slate-100': '#F1F5F9',
        'white': '#FFFFFF',
        'task-priority-high': '#EF4444',
        'task-priority-medium': '#F59E0B',
        'task-priority-low': '#0EA5E9',
      },
      boxShadow: {
        glow: "0 0 25px rgba(14, 165, 233, 0.4)",
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
        "card-hover": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
}