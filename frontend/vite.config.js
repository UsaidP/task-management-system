import react from "@vitejs/plugin-react"
import path from "path"
import tailwindcss from "tailwindcss"
import { fileURLToPath } from "url"
import { defineConfig } from "vite"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [tailwindcss],
    },
  },
  resolve: {
    alias: {
      "src/": `${path.resolve(__dirname, "src")}/`,
    },
  },
})
