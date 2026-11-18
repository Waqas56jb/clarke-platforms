import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// /api is proxied so the browser sees one origin, exactly as on Vercel (middleware.js). This keeps the
// HTTP-only session cookie same-site.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: {
      port: 5174,
      strictPort: true,
      proxy: { '/api': { target: env.VITE_API_TARGET || 'http://localhost:3001', changeOrigin: false } },
    },
  };
});
