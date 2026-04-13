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
    include: ["react", "react-dom", "react-router-dom", "framer-motion", "react-icons/fi", "dayjs"],
    // Pre-bundle these to avoid 504 on lazy-load
    entries: ["./src/**/*.jsx", "./src/**/*.js"],
  },
  build: {
    rollupOptions: {
      output: {
        // Minimal manual chunking — only for packages that DON'T depend on React.
        // Packages that import react/react-dom must NOT be split into separate
        // manual chunks because Rollup can't share React across chunks properly,
        // which causes duplicate React instances and breaks startTransition/hooks.
        // Error: "TypeError: undefined is not an object (evaluating 'M.S')"
        manualChunks: (id) => {
          if (!id.includes("node_modules")) return

          const pkgMatch = id.match(/node_modules\/((?:@[^/]+\/)?[^/]+)/)
          const pkg = pkgMatch ? pkgMatch[1] : ""

          // Pure utilities — no React dependency, safe to separate
          if (pkg === "dayjs" || pkg === "ms") {
            return "utils"
          }
          // Pure icon SVGs — no React runtime dependency
          if (pkg.startsWith("react-icons/")) {
            return "icons"
          }
          // All React-dependent libraries stay in the main chunk
          // (framer-motion, @tanstack/react-table, react-router, recharts, etc.)
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
    chunkSizeWarningLimit: 800,
    // Use terser for better minification (saves ~2.6MB vs esbuild)
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ["console.info", "console.warn"], // Remove these too
      },
    },
    cssCodeSplit: true,
    sourcemap: true,
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
