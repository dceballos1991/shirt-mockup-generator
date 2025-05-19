import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Add library configuration for embeddable script
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/main.tsx"),
      name: "ShirtMockupGenerator", // Global variable name when used in browser
      fileName: (format) => `shirt-mockup-generator.${format}.js`,
      formats: ["iife"], // Immediately Invoked Function Expression format
    },
    // Ensure CSS is extracted into a separate file
    cssCodeSplit: false,
    // Configure Rollup options
    rollupOptions: {
      output: {
        // Ensure external dependencies are also bundled
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
        // Make sure assets are properly handled
        assetFileNames: (assetInfo) => {
          if (assetInfo.names?.some((name) => name.endsWith(".css"))) {
            return "shirt-mockup-generator.css";
          }
          return assetInfo.names[0];
        },
      },
    },
  },
});
