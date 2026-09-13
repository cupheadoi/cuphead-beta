import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          markdown: [
            "react-markdown",
            "react-syntax-highlighter",
            "remark-gfm",
            "remark-math",
            "rehype-katex",
            "katex",
          ],
        },
      },
    },
  },
  server: {
    host: "0.0.0.0",
    port: 3000,
  },
});
