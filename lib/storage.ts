import { CreditBalance, SwapTransaction } from '../types';

// In-memory storage (replace with real database in production)
class Storage {
  private credits: Map<string, CreditBalance> = new Map();
  private transactions: Map<string, SwapTransaction> = new Map();

  // Credit operations
  getCreditBalance(walletAddress: string): CreditBalance | undefined {
    return this.credits.get(walletAddress.toLowerCase());
  }

  setCreditBalance(balance: CreditBalance): void {
    this.credits.set(balance.walletAddress.toLowerCase(), balance);
  }

  updateCredits(walletAddress: string, amount: number): CreditBalance {
    const existing = this.getCreditBalance(walletAddress) || {
      userId: walletAddress,
      walletAddress: walletAddress.toLowerCase(),
      credits: 0,
      lastUpdated: new Date(),
    };

    existing.credits += amount;
    existing.lastUpdated = new Date();
    this.setCreditBalance(existing);
    return existing;
  }

  // Transaction operations
  getTransaction(transactionId: string): SwapTransaction | undefined {
    return this.transactions.get(transactionId);
  }

  getTransactionsByWallet(walletAddress: string): SwapTransaction[] {
    return Array.from(this.transactions.values()).filter(
      (tx) => tx.walletAddress.toLowerCase() === walletAddress.toLowerCase()
    );
  }

  createTransaction(transaction: SwapTransaction): void {
    this.transactions.set(transaction.id, transaction);
  }

  updateTransaction(transactionId: string, updates: Partial<SwapTransaction>): SwapTransaction | undefined {
    const transaction = this.getTransaction(transactionId);
    if (!transaction) return undefined;

    const updated = { ...transaction, ...updates, updatedAt: new Date() };
    this.transactions.set(transactionId, updated);
    return updated;
  }

  getAllTransactions(): SwapTransaction[] {
    return Array.from(this.transactions.values());
  }
}

// Singleton instance
export const storage = new Storage();
