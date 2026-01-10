import { config } from './config';

export interface FeeCalculation {
  totalCreditsRequired: number; // Total credits needed including fees
  creditsAmount: number; // Original amount requested
  swapFee: number; // Percentage-based swap fee in credits
  networkFee: number; // Fixed network fee in credits
  totalFees: number; // Total fees in credits
  netSolAmount: number; // SOL amount after fees
  feePercentage: number; // Actual fee percentage applied
}

/**
 * Calculate fees for a swap transaction
 * Fees are deducted from credits before conversion to SOL
 */
export function calculateSwapFees(creditsAmount: number): FeeCalculation {
  // Calculate percentage-based swap fee
  const swapFeePercentage = config.fees.swapFeePercentage;
  let swapFee = Math.ceil((creditsAmount * swapFeePercentage) / 100);
  
  // Apply minimum fee if calculated fee is too low
  if (swapFee < config.fees.minFeeCredits) {
    swapFee = config.fees.minFeeCredits;
  }
  
  // Add fixed network/gas fee
  const networkFee = config.fees.networkFeeCredits;
  
  // Calculate total fees
  const totalFees = swapFee + networkFee;
  
  // Total credits required (amount + fees)
  const totalCreditsRequired = creditsAmount + totalFees;
  
  // Net credits that will be converted to SOL (after deducting fees)
  const netCreditsForSwap = creditsAmount;
  
  // Calculate SOL amount (fees are taken separately, full credits amount is swapped)
  const netSolAmount = netCreditsForSwap * config.credits.creditToSolRate;
  
  // Calculate actual fee percentage
  const feePercentage = (totalFees / creditsAmount) * 100;
  
  return {
    totalCreditsRequired,
    creditsAmount,
    swapFee,
    networkFee,
    totalFees,
    netSolAmount,
    feePercentage,
  };
}

/**
 * Validate that user has enough credits including fees
 */
export function validateCreditsWithFees(
  availableCredits: number,
  requestedAmount: number
): { valid: boolean; error?: string; feesRequired?: number } {
  const feeCalc = calculateSwapFees(requestedAmount);
  
  if (availableCredits < feeCalc.totalCreditsRequired) {
    return {
      valid: false,
      error: `Insufficient credits. Required: ${feeCalc.totalCreditsRequired} (${requestedAmount} + ${feeCalc.totalFees} fees), Available: ${availableCredits}`,
      feesRequired: feeCalc.totalFees,
    };
  }
  
  return { valid: true };
}

/**
 * Get fee breakdown for display
 */
export function getFeeBreakdown(creditsAmount: number): string {
  const fees = calculateSwapFees(creditsAmount);
  return `Swap Fee: ${fees.swapFee} credits (${config.fees.swapFeePercentage}%) + Network Fee: ${fees.networkFee} credits = Total: ${fees.totalFees} credits`;
}
