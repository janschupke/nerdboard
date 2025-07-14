import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/bundle-analysis.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
  server: {
    proxy: {
      '/api/coingecko': {
        target: 'https://api.coingecko.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/coingecko/, ''),
      },
      '/api/tradingeconomics': {
        target: 'https://api.tradingeconomics.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/tradingeconomics/, ''),
      },
      '/api/quandl': {
        target: 'https://www.quandl.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/quandl/, ''),
      },
      '/api/uxc': {
        target: 'https://www.uxc.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/uxc/, ''),
      },
      '/api/fred': {
        target: 'https://api.stlouisfed.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/fred/, ''),
      },
      '/api/alpha-vantage': {
        target: 'https://www.alphavantage.co',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/alpha-vantage/, ''),
      },
      '/api/yahoo-finance': {
        target: 'https://query1.finance.yahoo.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/yahoo-finance/, ''),
      },
      '/api/iex-cloud': {
        target: 'https://cloud.iexapis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/iex-cloud/, ''),
      },
      '/api/ecb': {
        target: 'https://api.data.ecb.europa.eu',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ecb/, ''),
      },
      '/api/emmi': {
        target: 'https://www.emmi-benchmarks.eu',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/emmi/, ''),
      },
    },
  },
});
