import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // TODO: temporarily commented to prevent rate limit
    // const url = `https://query1.finance.yahoo.com${req.url?.replace(/^\/api\/yahoo-finance/, '')}`;
    const url = '';

    // Create headers object without the host header
    const headers: Record<string, string> = {};
    Object.entries(req.headers).forEach(([key, value]) => {
      if (key.toLowerCase() !== 'host' && value) {
        headers[key] = Array.isArray(value) ? value[0] : value;
      }
    });

    const apiRes = await fetch(url, {
      method: req.method,
      headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
    });

    const data = await apiRes.arrayBuffer();

    // Set the response status and headers
    res.status(apiRes.status);
    apiRes.headers.forEach((value, key) => res.setHeader(key, value));

    // Send the response data
    res.send(Buffer.from(data));
  } catch (error) {
    // Handle network errors gracefully without logging to console
    console.error('Yahoo Finance API proxy error:', error);

    // Return a 500 error with a generic message
    res.status(500).json({
      error: 'Yahoo Finance API temporarily unavailable',
      message: 'Please try again later',
    });
  }
}
