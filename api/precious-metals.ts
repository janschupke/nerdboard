import type { VercelRequest, VercelResponse } from '@vercel/node';

interface GoldApiResponse {
  name: string;
  price: number;
  symbol: string;
  updatedAt: string;
  updatedAtReadable: string;
}

interface PreciousMetalsResponse {
  gold: {
    price: number;
    change_24h: number;
    change_percentage_24h: number;
  };
  silver: {
    price: number;
    change_24h: number;
    change_percentage_24h: number;
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Fetch gold and silver prices from gold-api.com
    const [goldResponse, silverResponse] = await Promise.all([
      fetch('https://api.gold-api.com/price/XAU'),
      fetch('https://api.gold-api.com/price/XAG'),
    ]);

    if (!goldResponse.ok || !silverResponse.ok) {
      throw new Error('Failed to fetch precious metals data');
    }

    const goldData: GoldApiResponse = await goldResponse.json();
    const silverData: GoldApiResponse = await silverResponse.json();

    // Convert to the expected format
    const preciousMetalsData: PreciousMetalsResponse = {
      gold: {
        price: goldData.price,
        change_24h: 0, // API doesn't provide 24h change data
        change_percentage_24h: 0, // API doesn't provide 24h change data
      },
      silver: {
        price: silverData.price,
        change_24h: 0, // API doesn't provide 24h change data
        change_percentage_24h: 0, // API doesn't provide 24h change data
      },
    };

    res.status(200).json(preciousMetalsData);
  } catch (error) {
    console.error('Error fetching precious metals data:', error);
    res.status(500).json({ error: 'Failed to fetch precious metals data' });
  }
}
