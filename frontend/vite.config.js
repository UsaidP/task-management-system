import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Keep names to prevent TDZ issues from recharts internal circular dependencies
  esbuild: {
    keepNames: true,
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Split large libraries into separate chunks
          if (id.includes("node_modules")) {
            // React core
            if (id.includes("react") || id.includes("react-dom")) {
              return "react-core"
            }
            // Router (lazy load)
            if (id.includes("react-router")) {
              return "router"
            }
            // UI libraries (lazy load only when needed)
            if (id.includes("framer-motion")) {
              return "animations"
            }
            if (id.includes("@mui")) {
              return "mui-date"
            }
            if (id.includes("@headlessui") || id.includes("@heroicons")) {
              return "ui-components"
            }
            // Drag and drop (lazy load)
            if (id.includes("react-dnd")) {
              return "drag-drop"
            }
            // Table library
            if (id.includes("@tanstack")) {
              return "table"
            }
            // Icons - split into smaller chunks
            if (id.includes("react-icons")) {
              return "icons"
            }
            // Utilities
            if (id.includes("dayjs") || id.includes("ms")) {
              return "utils"
            }
            // Charts - must be isolated to avoid TDZ circular dependency issues
            if (id.includes("recharts") || id.includes("d3-") || id.includes("victory-")) {
              return "charts"
            }
          }
        },
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith(".css")) {
            return "assets/css/[name]-[hash][extname]"
          }
          return "assets/[ext]/[name]-[hash][extname]"
        },
      },
    },
    chunkSizeWarningLimit: 500,
    // Use esbuild instead of terser — avoids TDZ issues with recharts circular deps
    minify: "esbuild",
    cssCodeSplit: true,
    sourcemap: false,
    reportCompressedSize: false,
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom"],
  },
})
