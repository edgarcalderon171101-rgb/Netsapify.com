import type { NextApiRequest, NextApiResponse } from 'next';
import { config, isAdmin } from '../../lib/config';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { adminWallet } = req.query;

  if (!adminWallet || typeof adminWallet !== 'string' || !isAdmin(adminWallet)) {
    return res.status(403).json({ error: 'Unauthorized - admin only' });
  }

  if (req.method === 'GET') {
    // Get current admin config
    return res.status(200).json({
      creditToSolRate: config.credits.creditToSolRate,
      minWithdrawalAmount: config.credits.minWithdrawalAmount,
      maxWithdrawalAmount: config.credits.maxWithdrawalAmount,
    });
  }

  if (req.method === 'POST') {
    // Note: In production, you would update these in a database
    // For this demo, these are read from environment variables and cannot be changed at runtime
    return res.status(200).json({
      message: 'Admin configuration is set via environment variables',
      currentConfig: {
        creditToSolRate: config.credits.creditToSolRate,
        minWithdrawalAmount: config.credits.minWithdrawalAmount,
        maxWithdrawalAmount: config.credits.maxWithdrawalAmount,
      },
    });
  }
}
