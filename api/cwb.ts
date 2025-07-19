import type { VercelRequest, VercelResponse } from '@vercel/node';

function filterHeaders(headers: Record<string, string | string[]>) {
  const filtered: Record<string, string | string[]> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() !== 'host') filtered[key] = value;
  }
  return filtered;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const url = `https://opendata.cwb.gov.tw${req.url?.replace(/^\/api\/cwb/, '')}`;
  const apiRes = await fetch(url, {
    method: req.method,
    headers: filterHeaders(req.headers as Record<string, string | string[]>),
    body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
  });
  const data = await apiRes.arrayBuffer();
  res.status(apiRes.status);
  apiRes.headers.forEach((value, key) => res.setHeader(key, value));
  res.send(Buffer.from(data));
}
