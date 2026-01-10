import { config } from './config';

export function validateCreditsAmount(amount: number): { valid: boolean; error?: string } {
  if (!amount || amount <= 0) {
    return { valid: false, error: 'Amount must be greater than 0' };
  }

  if (amount < config.credits.minWithdrawalAmount) {
    return { 
      valid: false, 
      error: `Minimum withdrawal amount is ${config.credits.minWithdrawalAmount} credits` 
    };
  }

  if (amount > config.credits.maxWithdrawalAmount) {
    return { 
      valid: false, 
      error: `Maximum withdrawal amount is ${config.credits.maxWithdrawalAmount} credits` 
    };
  }

  return { valid: true };
}

export function validateBtcAddress(address: string): { valid: boolean; error?: string } {
  // Basic BTC address validation (supports legacy, segwit, and taproot)
  const btcRegex = /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/;
  
  if (!address || !btcRegex.test(address)) {
    return { valid: false, error: 'Invalid Bitcoin address' };
  }

  return { valid: true };
}

export function validateSolanaAddress(address: string): { valid: boolean; error?: string } {
  // Basic Solana address validation (base58, 32-44 characters)
  const solanaRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  
  if (!address || !solanaRegex.test(address)) {
    return { valid: false, error: 'Invalid Solana wallet address' };
  }

  return { valid: true };
}

export function calculateSolAmount(credits: number): number {
  return credits * config.credits.creditToSolRate;
}

export function validateTransactionValue(
  creditsAmount: number,
  solAmount: number,
  expectedRate: number
): { valid: boolean; error?: string } {
  const expectedSol = creditsAmount * expectedRate;
  const tolerance = 0.0001; // Allow small floating point differences

  if (Math.abs(expectedSol - solAmount) > tolerance) {
    return { 
      valid: false, 
      error: 'Transaction value mismatch - amounts do not match expected rate' 
    };
  }

  return { valid: true };
}
