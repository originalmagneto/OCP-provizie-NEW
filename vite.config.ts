import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  optimizeDeps: {
    include: ["@headlessui/react"],
  },
  build: {
    commonjsOptions: {
      include: [/@headlessui\/react/, /node_modules/],
    },
  },
});
