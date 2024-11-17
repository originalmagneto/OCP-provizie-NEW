import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  build: {
    rollupOptions: {
      external: ["react", "react-dom"],
    },
    commonjsOptions: {
      include: [/node_modules/],
      extensions: [".js", ".cjs", ".jsx", ".tsx"],
    },
  },
  optimizeDeps: {
    include: ["framer-motion", "@headlessui/react"],
  },
});
