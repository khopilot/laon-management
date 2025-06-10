import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [react(), cloudflare()],
  define: {
    'import.meta.env.VITE_API_BASE_URL': '"http://localhost:5175"',
    'import.meta.env.VITE_APP_NAME': '"Loan Management System"',
    'import.meta.env.VITE_ENVIRONMENT': '"development"'
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://loan-management-software.pienikdelrieu.workers.dev',
        changeOrigin: true,
        secure: true,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  }
});
