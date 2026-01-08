import { FC, useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import axios from 'axios';

interface CreditBalance {
  walletAddress: string;
  credits: number;
  lastUpdated: string;
}

export const CreditDisplay: FC = () => {
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState<CreditBalance | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (publicKey) {
      fetchBalance();
    } else {
      setBalance(null);
    }
  }, [publicKey]);

  const fetchBalance = async () => {
    if (!publicKey) return;

    setLoading(true);
    try {
      const response = await axios.get(`/api/credits?walletAddress=${publicKey.toBase58()}`);
      setBalance(response.data);
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!publicKey) {
    return null;
  }

  if (loading) {
    return <div className="credit-display">Loading balance...</div>;
  }

  return (
    <div className="credit-display">
      <h3>Credit Balance</h3>
      <p className="balance">{balance?.credits || 0} Credits</p>
      <button onClick={fetchBalance} className="refresh-btn">
        Refresh
      </button>
    </div>
  );
};
