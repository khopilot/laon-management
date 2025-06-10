import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";
import path from "path";

export default defineConfig({
  plugins: [
    react(), 
    cloudflare({
      configPath: 'wrangler.json'
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    'import.meta.env.VITE_API_BASE_URL': '""',
    'import.meta.env.VITE_APP_NAME': '"Loan Management System"',
    'import.meta.env.VITE_ENVIRONMENT': '"development"'
  }
});
