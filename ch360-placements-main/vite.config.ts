import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: true,
    // Allow overriding via CLI --port or PORT env; fallback to 3000
    port: Number(process.env.PORT) || 3000,
    strictPort: false,
    open: true,
    // Use same port for HMR WebSocket as the HTTP server by default
    hmr: {
      port: Number(process.env.HMR_PORT) || Number(process.env.PORT) || undefined,
      clientPort: Number(process.env.HMR_CLIENT_PORT) || Number(process.env.PORT) || undefined,
    },
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    global: 'globalThis',
  },
}));
