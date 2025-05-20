import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const BASE_URL = "https://dceballos1991.github.io/shirt-mockup-generator/";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: BASE_URL,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  publicDir: "public",
  define: {
    "process.env": {}, // This ensures process.env is replaced with an empty object
    // You can also define specific environment variables:
    // 'process.env.NODE_ENV': JSON.stringify('production')
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
      },
    },
  },
});
