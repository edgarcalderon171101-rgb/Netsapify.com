/**
 * Utility functions for wallet address privacy and formatting
 */

/**
 * Mask a wallet address for privacy
 * Shows first 4 and last 4 characters with dots in between
 * Example: AbC1...xYz9
 */
export function maskWalletAddress(address: string, startChars: number = 4, endChars: number = 4): string {
  if (!address || address.length <= startChars + endChars) {
    return address;
  }
  
  const start = address.substring(0, startChars);
  const end = address.substring(address.length - endChars);
  return `${start}...${end}`;
}

/**
 * Mask a transaction signature for privacy
 * Shows first 8 and last 8 characters
 */
export function maskSignature(signature: string): string {
  return maskWalletAddress(signature, 8, 8);
}

/**
 * Mask a BTC address for privacy
 * Shows first 10 and last 10 characters
 */
export function maskBtcAddress(address: string): string {
  return maskWalletAddress(address, 10, 10);
}

/**
 * Mask any transaction ID
 * Shows first 6 and last 6 characters
 */
export function maskTransactionId(id: string): string {
  return maskWalletAddress(id, 6, 6);
}
