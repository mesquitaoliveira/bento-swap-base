import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  server: {
    proxy: {
      "/api/coingecko": {
        target: "https://api.coingecko.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/coingecko/, ""),
        secure: true,
      },
    },
  },
});
