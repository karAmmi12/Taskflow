import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5173,
    // 🔧 Configuration proxy pour Docker
    proxy: {
      '/api': {
        target: 'http://taskflow-backend-dev:5000', // Nom du service Docker
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('❌ Erreur proxy:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('🔄 Proxy request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('✅ Proxy response:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
})