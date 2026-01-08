export const config = {
  solana: {
    network: process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet',
    rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  },
  admin: {
    walletAddress: process.env.ADMIN_WALLET_ADDRESS || '',
    secretKey: process.env.ADMIN_SECRET_KEY || '',
  },
  bridge: {
    apiKey: process.env.BRIDGE_API_KEY || '',
    apiUrl: process.env.BRIDGE_API_URL || '',
  },
  credits: {
    creditToSolRate: parseFloat(process.env.CREDIT_TO_SOL_RATE || '0.001'),
    minWithdrawalAmount: parseInt(process.env.MIN_WITHDRAWAL_AMOUNT || '10', 10),
    maxWithdrawalAmount: parseInt(process.env.MAX_WITHDRAWAL_AMOUNT || '10000', 10),
  },
};

export function isAdmin(walletAddress: string): boolean {
  return walletAddress.toLowerCase() === config.admin.walletAddress.toLowerCase();
}
