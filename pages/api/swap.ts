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
  validateTransactionValue,
} from '../../lib/validation';
import { calculateSwapFees, validateCreditsWithFees } from '../../lib/fees';
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
    if (!balance) {
      return res.status(400).json({ 
        error: 'No credit balance found',
        available: 0,
        required: creditsAmount,
      });
    }

    // Calculate fees
    const feeCalculation = calculateSwapFees(creditsAmount);
    
    // Validate user has enough credits including fees
    const creditsValidationWithFees = validateCreditsWithFees(balance.credits, creditsAmount);
    if (!creditsValidationWithFees.valid) {
      return res.status(400).json({ 
        error: creditsValidationWithFees.error,
        available: balance.credits,
        required: feeCalculation.totalCreditsRequired,
        fees: {
          swapFee: feeCalculation.swapFee,
          networkFee: feeCalculation.networkFee,
          totalFees: feeCalculation.totalFees,
          feePercentage: feeCalculation.feePercentage,
        },
      });
    }

    // Calculate SOL amount (net amount after fees are deducted from credits)
    const solAmount = feeCalculation.netSolAmount;

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
    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
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
      // Fee tracking
      swapFee: feeCalculation.swapFee,
      networkFee: feeCalculation.networkFee,
      totalFees: feeCalculation.totalFees,
      totalCreditsCharged: feeCalculation.totalCreditsRequired,
    };

    storage.createTransaction(transaction);

    // Deduct total credits (amount + fees)
    storage.updateCredits(walletAddress, -feeCalculation.totalCreditsRequired);

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
        fees: {
          swapFee: feeCalculation.swapFee,
          networkFee: feeCalculation.networkFee,
          totalFees: feeCalculation.totalFees,
          feePercentage: feeCalculation.feePercentage,
        },
        amounts: {
          creditsAmount,
          totalCreditsCharged: feeCalculation.totalCreditsRequired,
          solAmount,
        },
      });
    } catch (error) {
      // Rollback all credits on error (amount + fees)
      storage.updateCredits(walletAddress, feeCalculation.totalCreditsRequired);
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
