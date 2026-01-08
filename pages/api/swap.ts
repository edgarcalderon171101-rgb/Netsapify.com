import type { NextApiRequest, NextApiResponse } from 'next';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import { storage } from '../../lib/storage';
import { solanaService } from '../../lib/solana';
import { bridgeService } from '../../lib/bridge';
import { config } from '../../lib/config';
import {
  validateCreditsAmount,
  validateBtcAddress,
  validateSolanaAddress,
  calculateSolAmount,
  validateTransactionValue,
} from '../../lib/validation';
import { SwapTransaction } from '../../types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { walletAddress, creditsAmount, btcAddress } = req.body;

  try {
    // Validate inputs
    const walletValidation = validateSolanaAddress(walletAddress);
    if (!walletValidation.valid) {
      return res.status(400).json({ error: walletValidation.error });
    }

    const creditsValidation = validateCreditsAmount(creditsAmount);
    if (!creditsValidation.valid) {
      return res.status(400).json({ error: creditsValidation.error });
    }

    const btcValidation = validateBtcAddress(btcAddress);
    if (!btcValidation.valid) {
      return res.status(400).json({ error: btcValidation.error });
    }

    // Check credit balance
    const balance = storage.getCreditBalance(walletAddress);
    if (!balance || balance.credits < creditsAmount) {
      return res.status(400).json({ 
        error: 'Insufficient credits',
        available: balance?.credits || 0,
        required: creditsAmount,
      });
    }

    // Calculate SOL amount
    const solAmount = calculateSolAmount(creditsAmount);

    // Validate transaction value
    const valueValidation = validateTransactionValue(
      creditsAmount,
      solAmount,
      config.credits.creditToSolRate
    );
    if (!valueValidation.valid) {
      return res.status(400).json({ error: valueValidation.error });
    }

    // Create transaction record
    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const transaction: SwapTransaction = {
      id: transactionId,
      userId: walletAddress,
      walletAddress,
      creditsAmount,
      solAmount,
      btcAddress,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    storage.createTransaction(transaction);

    // Deduct credits
    storage.updateCredits(walletAddress, -creditsAmount);

    // Step 1: Swap credits to SOL (on-chain)
    try {
      if (!config.admin.secretKey) {
        throw new Error('Admin secret key not configured');
      }

      const adminKeypair = Keypair.fromSecretKey(bs58.decode(config.admin.secretKey));
      const solSignature = await solanaService.swapCreditsToSol(
        walletAddress,
        solAmount,
        adminKeypair
      );

      storage.updateTransaction(transactionId, {
        status: 'credits_to_sol',
        solSignature,
      });

      // Step 2: Bridge SOL to BTC
      const bridgeResponse = await bridgeService.bridgeSolToBtc({
        fromChain: 'solana',
        toChain: 'bitcoin',
        amount: solAmount,
        destinationAddress: btcAddress,
        sourceSignature: solSignature,
      });

      storage.updateTransaction(transactionId, {
        status: 'sol_to_btc',
        bridgeTransactionId: bridgeResponse.bridgeTransactionId,
      });

      return res.status(200).json({
        transactionId,
        status: 'processing',
        solSignature,
        bridgeTransactionId: bridgeResponse.bridgeTransactionId,
        estimatedTime: bridgeResponse.estimatedTime,
        message: 'Swap initiated successfully',
      });
    } catch (error) {
      // Rollback credits on error
      storage.updateCredits(walletAddress, creditsAmount);
      storage.updateTransaction(transactionId, {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  } catch (error) {
    console.error('Error processing swap:', error);
    return res.status(500).json({
      error: 'Failed to process swap',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
