import { Connection, PublicKey, Transaction, SystemProgram, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { config } from './config';

export class SolanaService {
  private connection: Connection;

  constructor() {
    this.connection = new Connection(config.solana.rpcUrl, 'confirmed');
  }

  async getConnection(): Promise<Connection> {
    return this.connection;
  }

  async swapCreditsToSol(
    userWalletAddress: string,
    solAmount: number,
    adminKeypair: Keypair
  ): Promise<string> {
    try {
      const userPublicKey = new PublicKey(userWalletAddress);
      const lamports = Math.floor(solAmount * LAMPORTS_PER_SOL);

      // Create transaction to send SOL from admin wallet to user wallet
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: adminKeypair.publicKey,
          toPubkey: userPublicKey,
          lamports,
        })
      );

      // Get recent blockhash
      const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = adminKeypair.publicKey;

      // Sign and send transaction
      transaction.sign(adminKeypair);
      const signature = await this.connection.sendRawTransaction(transaction.serialize());

      // Confirm transaction
      await this.connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });

      return signature;
    } catch (error) {
      console.error('Error swapping credits to SOL:', error);
      throw new Error(`Failed to swap credits to SOL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getBalance(walletAddress: string): Promise<number> {
    try {
      const publicKey = new PublicKey(walletAddress);
      const balance = await this.connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Error getting balance:', error);
      return 0;
    }
  }

  async verifyTransaction(signature: string): Promise<boolean> {
    try {
      const status = await this.connection.getSignatureStatus(signature);
      return status.value?.confirmationStatus === 'confirmed' || 
             status.value?.confirmationStatus === 'finalized';
    } catch (error) {
      console.error('Error verifying transaction:', error);
      return false;
    }
  }
}

export const solanaService = new SolanaService();
