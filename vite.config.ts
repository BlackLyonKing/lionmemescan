import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  base: "./",
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    outDir: "docs",
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  optimizeDeps: {
    include: [
      '@solana/web3.js',
      '@solana/wallet-adapter-react',
      '@solana/wallet-adapter-base',
      '@solana/wallet-adapter-phantom',
      '@solana/wallet-adapter-walletconnect',
      '@solana/wallet-adapter-react-ui',
      '@mendable/firecrawl-js',
      'bs58'
    ],
    esbuildOptions: {
      target: 'esnext',
    }
  }
}));