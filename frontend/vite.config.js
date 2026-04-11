import react from "@vitejs/plugin-react"
import { visualizer } from "rollup-plugin-visualizer"
import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Bundle visualizer - opens automatically after build to analyze sizes
    visualizer({
      open: false, // Set to true to auto-open after build
      gzipSize: true,
      brotliSize: true,
      filename: "dist/stats.html",
    }),
  ],
  // Keep names to prevent TDZ issues from recharts internal circular dependencies
  esbuild: {
    keepNames: true,
    // Disable tree shaking for recharts
    treeShaking: false,
  },
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      protocol: "ws",
      host: "localhost",
    },
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
    // Prevent 504 Outdated Optimize Dep errors with lazy-loaded chunks
    warmup: {
      clientFiles: [
        "./src/pages/Overview.jsx",
        "./src/pages/Home.jsx",
        "./src/layouts/AppLayout.jsx",
      ],
    },
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "framer-motion",
      "react-icons/fi",
      "dayjs",
    ],
    // Pre-bundle these to avoid 504 on lazy-load
    entries: ["./src/**/*.jsx", "./src/**/*.js"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Split large libraries into separate chunks
          if (id.includes("node_modules")) {
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
            // IMPORTANT: Don't split recharts/d3/victory - they have circular dependencies
            // that cause TDZ errors when extracted to separate chunks.
            // Let them stay bundled with the lazy-loaded pages that use them.
            // ALSO: Don't split react/react-dom to prevent hook issues
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
    // Use terser for better minification (saves ~2.6MB vs esbuild)
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ["console.info", "console.warn"], // Remove these too
      },
      // Reduce bundle size by removing unused code
      mangle: {
        properties: {
          regex: /^_/, // Mangle properties starting with underscore
        },
      },
    },
    cssCodeSplit: true,
    sourcemap: "dev",
    reportCompressedSize: false,
  },
  // Prevent React from being split into different chunks
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  // Fix for recharts circular dependency TDZ issues
  commonjsOptions: {
    transformMixedEsModules: true,
  },
})
