import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      // CoinGecko API
      '/api/coingecko': {
        target: 'https://api.coingecko.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/coingecko/, ''),
      },
      // OpenWeatherMap API
      '/api/openweathermap': {
        target: 'https://api.openweathermap.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/openweathermap/, ''),
      },
      // Alpha Vantage API
      '/api/alpha-vantage': {
        target: 'https://www.alphavantage.co',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/alpha-vantage/, ''),
      },
      // FRED API
      '/api/fred': {
        target: 'https://api.stlouisfed.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/fred/, ''),
      },
      // EMMI API
      '/api/emmi': {
        target: 'https://www.emmi-benchmarks.eu',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/emmi/, ''),
      },
      // Gold API
      '/api/gold-api': {
        target: 'https://www.gold-api.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/gold-api/, ''),
      },
      // Metals API
      '/api/metals-api': {
        target: 'https://metals-api.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/metals-api/, ''),
      },
      // USGS API
      '/api/usgs': {
        target: 'https://earthquake.usgs.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/usgs/, ''),
      },
      // CWB API
      '/api/cwb': {
        target: 'https://opendata.cwb.gov.tw',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/cwb/, ''),
      },
      // WorldTime API
      '/api/time': {
        target: 'https://worldtimeapi.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/time/, ''),
      },
      // Precious Metals (combined endpoint) - using mock data for now
      '/api/precious-metals': {
        target: 'https://httpbin.org',
        changeOrigin: true,
        rewrite: () => '/json',
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Return mock precious metals data
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              gold: {
                price: 3350.31,
                change_24h: 0,
                change_percentage_24h: 0,
              },
              silver: {
                price: 38.19,
                change_24h: 0,
                change_percentage_24h: 0,
              },
            }));
          });
        },
      },
    },
  },
});
