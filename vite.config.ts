import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 8080,
  },
  build: {
    outDir: "docs",
    sourcemap: true,
  },
  optimizeDeps: {
    include: [
      "@solana/web3.js",
      "@solana/wallet-adapter-react",
      "@solana/wallet-adapter-base",
      "@solana/wallet-adapter-phantom",
      "@solana/wallet-adapter-walletconnect",
      "@solana/wallet-adapter-react-ui",
      "@mendable/firecrawl-js",
      "bs58"
    ],
    esbuildOptions: {
      target: 'esnext'
    }
  }
});