/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'background': '#0D1117',
        'primary': '#161B22',
        'secondary': '#21262D',
        'accent': '#58A6FF',
        'text-primary': '#C9D1D9',
        'text-secondary': '#8B949E',
      }
    },
  },
  plugins: [],
}
