import type { VercelRequest, VercelResponse } from '@vercel/node';

function filterHeaders(
  headers: Record<string, string | string[] | undefined>,
): Record<string, string> {
  const filtered: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() !== 'host' && typeof value === 'string') {
      filtered[key] = value;
    }
  }
  return filtered;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const url = `https://www.gold-api.com${req.url?.replace(/^\/api\/gold-api/, '')}`;
  const apiRes = await fetch(url, {
    method: req.method,
    headers: filterHeaders(req.headers as Record<string, string | string[] | undefined>),
    body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
  });
  const data = await apiRes.arrayBuffer();
  res.status(apiRes.status);
  apiRes.headers.forEach((value, key) => res.setHeader(key, value));
  res.send(Buffer.from(data));
}
