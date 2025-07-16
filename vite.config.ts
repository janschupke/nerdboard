import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
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
      '/api/openweathermap': {
        target: 'https://api.openweathermap.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/openweathermap/, ''),
      },
      '/api/time': {
        target: 'https://worldtimeapi.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/time/, ''),
      },
      '/api/precious-metals': {
        target: 'https://api.metals.live',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/precious-metals/, ''),
      },
      '/api/uranium-html': {
        target: 'https://tradingeconomics.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/uranium-html/, '/commodity/uranium'),
      },
      '/api/metals-api': {
        target: 'https://metals-api.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/metals-api/, ''),
      },
    },
  },
});
