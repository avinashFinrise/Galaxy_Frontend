import react from "@vitejs/plugin-react";
import Analyzer from 'rollup-plugin-analyzer';
import { defineConfig } from "vite";


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), Analyzer({ summaryOnly: true })],
  server: {
    host: "192.168.15.105",
    port: 3000,
  },
  esbuild: {
    treeShaking: true,
  },
  build: {
    minify: 'terser',
    brotliSize: true,
    chunkSizeWarningLimit: 1600,
  },
});
