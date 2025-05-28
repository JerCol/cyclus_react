import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';



export default defineConfig({
  plugins: [[tailwindcss()]],
  server: {
    host: '0.0.0.0',          // expose to the outside world
    port: 5173,               // keep Gitpod’s default port
    strictPort: true,         // fail fast if 5173 is busy
    allowedHosts: ['.gitpod.io'],   // allow any *.gitpod.io sub-domain
    // OR just:  allowedHosts: true   // (less secure, but simplest)
  }
})