export interface CreditBalance {
  userId: string;
  walletAddress: string;
  credits: number;
  lastUpdated: Date;
}

export interface SwapTransaction {
  id: string;
  userId: string;
  walletAddress: string;
  creditsAmount: number;
  solAmount: number;
  btcAmount?: number;
  btcAddress?: string;
  status: 'pending' | 'credits_to_sol' | 'sol_to_btc' | 'completed' | 'failed';
  solSignature?: string;
  bridgeTransactionId?: string;
  createdAt: Date;
  updatedAt: Date;
  errorMessage?: string;
}

export interface AdminConfig {
  creditToSolRate: number;
  minWithdrawalAmount: number;
  maxWithdrawalAmount: number;
}

export interface SwapRequest {
  walletAddress: string;
  creditsAmount: number;
  btcAddress: string;
}

export interface SwapResponse {
  transactionId: string;
  status: string;
  solSignature?: string;
  message: string;
}

export interface BridgeRequest {
  fromChain: 'solana';
  toChain: 'bitcoin';
  amount: number;
  destinationAddress: string;
  sourceSignature: string;
}

export interface BridgeResponse {
  bridgeTransactionId: string;
  status: string;
  estimatedTime: number;
  btcTxId?: string;
}
