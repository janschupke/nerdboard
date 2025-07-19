import type { VercelRequest, VercelResponse } from '@vercel/node';

interface CoinbaseResponse {
  data: {
    amount: string;
    base: string;
    currency: string;
  };
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
    // Fetch gold and silver prices from Coinbase
    const [goldResponse, silverResponse] = await Promise.all([
      fetch('https://api.coinbase.com/v2/prices/XAU-USD/spot'),
      fetch('https://api.coinbase.com/v2/prices/XAG-USD/spot'),
    ]);

    if (!goldResponse.ok || !silverResponse.ok) {
      throw new Error('Failed to fetch precious metals data');
    }

    const goldData: CoinbaseResponse = await goldResponse.json();
    const silverData: CoinbaseResponse = await silverResponse.json();

    // Convert to the expected format
    const preciousMetalsData: PreciousMetalsResponse = {
      gold: {
        price: parseFloat(goldData.data.amount),
        change_24h: 0, // Coinbase doesn't provide 24h change in spot endpoint
        change_percentage_24h: 0, // Coinbase doesn't provide 24h change in spot endpoint
      },
      silver: {
        price: parseFloat(silverData.data.amount),
        change_24h: 0, // Coinbase doesn't provide 24h change in spot endpoint
        change_percentage_24h: 0, // Coinbase doesn't provide 24h change in spot endpoint
      },
    };

    res.status(200).json(preciousMetalsData);
  } catch (error) {
    console.error('Error fetching precious metals data:', error);
    res.status(500).json({ error: 'Failed to fetch precious metals data' });
  }
} 
