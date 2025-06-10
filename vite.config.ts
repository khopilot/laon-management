import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [
    react(), 
    cloudflare({
      configPath: 'wrangler.json'
    })
  ],
  define: {
    'import.meta.env.VITE_API_BASE_URL': '""',
    'import.meta.env.VITE_APP_NAME': '"Loan Management System"',
    'import.meta.env.VITE_ENVIRONMENT': '"development"'
  }
});
