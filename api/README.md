# API Proxy Functions

This directory contains Vercel serverless functions that act as CORS proxies for external APIs used by the dashboard tiles.

## Overview

These functions solve CORS (Cross-Origin Resource Sharing) issues by:

1. **Local Development**: Using Vite's proxy configuration in `vite.config.ts`
2. **Production (Vercel)**: Using these serverless functions as API proxies

## How It Works

Each function:

- Receives requests at `/api/{service-name}/*`
- Forwards them to the corresponding external API
- Returns the response with proper CORS headers
- Preserves all query parameters and request methods

## Available Proxies

| Function              | External API                        | Used By                 |
| --------------------- | ----------------------------------- | ----------------------- |
| `tradingeconomics.ts` | https://api.tradingeconomics.com    | Uranium tile            |
| `quandl.ts`           | https://www.quandl.com              | Uranium tile (fallback) |
| `uxc.ts`              | https://www.uxc.com                 | Uranium tile (fallback) |
| `alpha-vantage.ts`    | https://www.alphavantage.co         | GDX ETF tile            |
| `yahoo-finance.ts`    | https://query1.finance.yahoo.com    | GDX ETF tile            |
| `iex-cloud.ts`        | https://cloud.iexapis.com           | GDX ETF tile            |
| `openweathermap.ts`   | https://api.openweathermap.org      | Weather tile            |
| `weatherapi.ts`       | https://api.weatherapi.com          | Weather tile            |
| `accuweather.ts`      | https://dataservice.accuweather.com | Weather tile            |
| `emmi.ts`             | https://www.emmi-benchmarks.eu      | Euribor rate tile       |
| `ecb.ts`              | https://api.data.ecb.europa.eu      | Euribor rate tile       |
| `fred.ts`             | https://api.stlouisfed.org          | Federal funds rate tile |
| `coingecko.ts`        | https://api.coingecko.com           | Cryptocurrency tile     |

## URL Mapping

Requests are mapped as follows:

- `/api/tradingeconomics/commodity/uranium?range=1Y` → `https://api.tradingeconomics.com/commodity/uranium?range=1Y`
- `/api/coingecko/api/v3/coins/markets?vs_currency=usd` → `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd`

## Development vs Production

### Local Development

- Uses Vite proxy configuration in `vite.config.ts`
- No serverless functions needed
- Automatic CORS handling

### Production (Vercel)

- Uses these serverless functions
- Automatic deployment when pushed to connected repository
- No additional configuration needed

## Error Handling

All functions include:

- Proper error status code forwarding
- Response header preservation
- Fallback to mock data in tile components if API fails

## Testing

Run tests with:

```bash
npm run test:run
```

Tests are located in `api/__tests__/` directory.

## Adding New APIs

To add a new API proxy:

1. Create a new file: `api/{service-name}.ts`
2. Update the template with your target URL
3. Add the proxy to `vite.config.ts` for local development
4. Update tile constants to use `/api/{service-name}` URLs
5. Add tests in `api/__tests__/`

Example:

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const url = `https://api.example.com${req.url?.replace(/^\/api\/example/, '')}`;
  const apiRes = await fetch(url, {
    method: req.method,
    headers: { ...req.headers, host: undefined },
    body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
  });
  const data = await apiRes.arrayBuffer();
  res.status(apiRes.status);
  apiRes.headers.forEach((value, key) => res.setHeader(key, value));
  res.send(Buffer.from(data));
}
```

## Troubleshooting

### CORS Errors Still Appearing

- Check that your tile is using `/api/` URLs instead of direct external URLs
- Verify the proxy function exists and is correctly named
- Check Vercel deployment logs for serverless function errors

### API Rate Limiting

- Some APIs have rate limits that apply to the proxy
- Consider implementing caching in the proxy functions
- Monitor Vercel function execution limits

### Environment Variables

- API keys should be set as environment variables in Vercel
- Use `import.meta.env.VITE_*` for client-side variables
- Use `process.env.*` for serverless function variables
