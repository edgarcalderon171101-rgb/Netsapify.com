import { FC, useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import axios from 'axios';

interface Transaction {
  id: string;
  creditsAmount: number;
  solAmount: number;
  btcAmount?: number;
  btcAddress: string;
  status: string;
  solSignature?: string;
  bridgeTransactionId?: string;
  createdAt: string;
  errorMessage?: string;
}

export const TransactionHistory: FC = () => {
  const { publicKey } = useWallet();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (publicKey) {
      fetchTransactions();
    } else {
      setTransactions([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey]);

  const fetchTransactions = async () => {
    if (!publicKey) return;

    setLoading(true);
    try {
      const response = await axios.get(`/api/transactions?walletAddress=${publicKey.toBase58()}`);
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!publicKey) {
    return null;
  }

  if (loading) {
    return <div className="transaction-history">Loading transactions...</div>;
  }

  if (transactions.length === 0) {
    return (
      <div className="transaction-history">
        <h3>Transaction History</h3>
        <p>No transactions yet</p>
      </div>
    );
  }

  return (
    <div className="transaction-history">
      <h3>Transaction History</h3>
      <button onClick={fetchTransactions} className="refresh-btn">
        Refresh
      </button>
      <div className="transactions-list">
        {transactions.map((tx) => (
          <div key={tx.id} className="transaction-item">
            <div className="tx-header">
              <span className={`status status-${tx.status}`}>{tx.status}</span>
              <span className="date">{new Date(tx.createdAt).toLocaleString()}</span>
            </div>
            <div className="tx-details">
              <p>Credits: {tx.creditsAmount}</p>
              <p>SOL: {tx.solAmount.toFixed(6)}</p>
              {tx.btcAmount && <p>BTC: {tx.btcAmount.toFixed(8)}</p>}
              <p>BTC Address: {tx.btcAddress.substring(0, 20)}...</p>
              {tx.solSignature && (
                <p className="signature">
                  SOL Tx: {tx.solSignature.substring(0, 20)}...
                </p>
              )}
              {tx.bridgeTransactionId && (
                <p>Bridge ID: {tx.bridgeTransactionId}</p>
              )}
              {tx.errorMessage && (
                <p className="error">Error: {tx.errorMessage}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
