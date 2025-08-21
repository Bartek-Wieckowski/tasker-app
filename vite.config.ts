import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
// import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    // Tymczasowo wyłączamy VitePWA - użyjemy własnego SW
    // VitePWA({
    //   registerType: "autoUpdate",
    //   includeAssets: ["vite.svg"],
    //   strategies: "generateSW",
    //   manifest: {
    //     name: "Tasker App",
    //     short_name: "TaskerApp",
    //     description: "Todo application with push notifications",
    //     theme_color: "#ffffff",
    //     icons: [
    //       {
    //         src: "vite.svg",
    //         sizes: "192x192",
    //         type: "image/svg+xml",
    //       },
    //       {
    //         src: "vite.svg",
    //         sizes: "512x512",
    //         type: "image/svg+xml",
    //       },
    //     ],
    //     start_url: "/",
    //     display: "standalone",
    //     background_color: "#ffffff",
    //   },
    // }),
  ],
  base: "/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
