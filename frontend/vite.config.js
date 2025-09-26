// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path"; // Import 'path' module

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Add this alias: whenever you import from 'src/', it points to the frontend/src directory
      "src/": `${path.resolve(__dirname, "src")}/`,
    },
  },
});
