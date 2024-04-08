import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  plugins: [nodePolyfills(), react()],
  server: {
    host: "127.0.0.1",
    port: 3000,
  },
  build: {
    rollupOptions: {
      external: ["./vite-plugin-node-polyfills/shims/buffer"],
    },
  },
});
