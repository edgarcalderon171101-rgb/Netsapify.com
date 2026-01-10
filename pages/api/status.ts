import type { NextApiRequest, NextApiResponse } from 'next';
import { storage } from '../../lib/storage';
import { bridgeService } from '../../lib/bridge';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { transactionId } = req.query;

  if (!transactionId || typeof transactionId !== 'string') {
    return res.status(400).json({ error: 'Transaction ID is required' });
  }

  try {
    const transaction = storage.getTransaction(transactionId);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // If transaction has a bridge ID and is not completed, check bridge status
    if (transaction.bridgeTransactionId && transaction.status !== 'completed' && transaction.status !== 'failed') {
      try {
        const bridgeStatus = await bridgeService.checkBridgeStatus(transaction.bridgeTransactionId);
        
        if (bridgeStatus.status === 'completed' && bridgeStatus.btcTxId) {
          storage.updateTransaction(transactionId, {
            status: 'completed',
            btcAmount: transaction.solAmount, // In production, get actual BTC amount from bridge
          });
        }
      } catch (error) {
        console.error('Error checking bridge status:', error);
        // Don't fail the status check if bridge API is unavailable
      }
    }

    // Get updated transaction
    const updatedTransaction = storage.getTransaction(transactionId);

    return res.status(200).json(updatedTransaction);
  } catch (error) {
    console.error('Error getting transaction status:', error);
    return res.status(500).json({
      error: 'Failed to get transaction status',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
