import type { NextApiRequest, NextApiResponse } from 'next';
import { storage } from '../../lib/storage';
import { isAdmin } from '../../lib/config';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { walletAddress } = req.query;

  if (!walletAddress || typeof walletAddress !== 'string') {
    return res.status(400).json({ error: 'Wallet address is required' });
  }

  try {
    if (req.method === 'GET') {
      // Get credit balance
      const balance = storage.getCreditBalance(walletAddress);
      return res.status(200).json({
        walletAddress,
        credits: balance?.credits || 0,
        lastUpdated: balance?.lastUpdated || new Date(),
      });
    }

    if (req.method === 'POST') {
      // Add or update credits (admin only)
      const { amount, adminWallet } = req.body;

      if (!isAdmin(adminWallet)) {
        return res.status(403).json({ error: 'Unauthorized - admin only' });
      }

      if (typeof amount !== 'number') {
        return res.status(400).json({ error: 'Amount must be a number' });
      }

      const balance = storage.updateCredits(walletAddress, amount);
      return res.status(200).json({
        walletAddress: balance.walletAddress,
        credits: balance.credits,
        lastUpdated: balance.lastUpdated,
      });
    }
  } catch (error) {
    console.error('Error handling credits request:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
