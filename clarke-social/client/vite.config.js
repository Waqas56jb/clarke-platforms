import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// The API, uploads and Socket.IO are proxied so the browser sees one origin, exactly as when the
// original server served the page itself. This keeps the HTTP-only session cookie same-site.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.VITE_API_TARGET || 'http://localhost:3000';
  return {
    plugins: [react()],
    server: {
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': { target, changeOrigin: false },
        '/uploads': { target, changeOrigin: false },
        '/socket.io': { target, ws: true, changeOrigin: false },
      },
    },
  };
});
