import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      // All /api/* proxies removed; serverless handlers in /api handle all API endpoints.
    },
  },
});
