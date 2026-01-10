import type { NextApiRequest, NextApiResponse } from 'next';
import { storage } from '../../lib/storage';
import { isAdmin } from '../../lib/config';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { adminWallet, walletAddress } = req.query;

  try {
    // Admin can see all transactions or filter by wallet
    // Users can only see their own transactions
    let transactions;

    if (adminWallet && typeof adminWallet === 'string' && isAdmin(adminWallet)) {
      // Admin view
      if (walletAddress && typeof walletAddress === 'string') {
        transactions = storage.getTransactionsByWallet(walletAddress);
      } else {
        transactions = storage.getAllTransactions();
      }
    } else if (walletAddress && typeof walletAddress === 'string') {
      // User view - only their own transactions
      transactions = storage.getTransactionsByWallet(walletAddress);
    } else {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    return res.status(200).json({ transactions });
  } catch (error) {
    console.error('Error getting transactions:', error);
    return res.status(500).json({
      error: 'Failed to get transactions',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
