import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { ports } from "@template/configs/ports";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: ports.dashboard,
  },
});
