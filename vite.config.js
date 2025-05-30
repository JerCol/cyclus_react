import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';      // ← add this
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss(), react()],           // ← flatten array
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: ['.gitpod.io'],              // or simply: allowedHosts: true
  },
});