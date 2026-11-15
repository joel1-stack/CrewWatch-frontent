import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "icon-192.png", "icon-512.png"],
      manifest: {
        name: "CrewWatch: Astronaut Health Monitoring",
        short_name: "CrewWatch",
        description:
          "Real-time astronaut vitals monitoring, early-warning classification and automated mission health reports.",
        theme_color: "#0b1220",
        background_color: "#0b1220",
        display: "standalone",
        orientation: "portrait",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
        ]
      },
      workbox: {
        // Network-first for API; cache-first for app shell.
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/api") || url.pathname.startsWith("/ws"),
            handler: "NetworkOnly"
          },
          {
            urlPattern: ({ url }) => url.origin === self.location.origin,
            handler: "StaleWhileRevalidate"
          }
        ]
      }
    })
  ],
  server: {
    port: 5173
  }
});
