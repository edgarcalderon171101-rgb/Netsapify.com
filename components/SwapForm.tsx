import { FC, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import axios from 'axios';

export const SwapForm: FC = () => {
  const { publicKey } = useWallet();
  const [creditsAmount, setCreditsAmount] = useState('');
  const [btcAddress, setBtcAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    transactionId?: string;
    status?: string;
    solSignature?: string;
    bridgeTransactionId?: string;
    estimatedTime?: number;
  } | null>(null);
  const [error, setError] = useState('');

  const handleSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await axios.post('/api/swap', {
        walletAddress: publicKey.toBase58(),
        creditsAmount: parseFloat(creditsAmount),
        btcAddress,
      });

      setResult(response.data);
      setCreditsAmount('');
      setBtcAddress('');
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to process swap');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    if (!result?.transactionId) return;

    try {
      const response = await axios.get(`/api/status?transactionId=${result.transactionId}`);
      setResult((prev) => prev ? { ...prev, ...response.data } : response.data);
    } catch (err) {
      console.error('Error checking status:', err);
    }
  };

  if (!publicKey) {
    return (
      <div className="swap-form">
        <p>Please connect your wallet to start swapping</p>
      </div>
    );
  }

  return (
    <div className="swap-form">
      <h2>Swap Credits to BTC</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      {result && (
        <div className="result-message">
          <h3>Swap Initiated!</h3>
          <p>Transaction ID: {result.transactionId}</p>
          <p>Status: {result.status}</p>
          {result.solSignature && <p>SOL Signature: {result.solSignature}</p>}
          {result.bridgeTransactionId && <p>Bridge ID: {result.bridgeTransactionId}</p>}
          {result.estimatedTime && <p>Estimated time: {Math.floor(result.estimatedTime / 60)} minutes</p>}
          <button onClick={handleCheckStatus} className="status-btn">
            Check Status
          </button>
        </div>
      )}

      <form onSubmit={handleSwap}>
        <div className="form-group">
          <label htmlFor="credits">Credits Amount</label>
          <input
            id="credits"
            type="number"
            value={creditsAmount}
            onChange={(e) => setCreditsAmount(e.target.value)}
            placeholder="Enter credits amount"
            required
            min="1"
            step="1"
          />
        </div>

        <div className="form-group">
          <label htmlFor="btcAddress">Bitcoin Address</label>
          <input
            id="btcAddress"
            type="text"
            value={btcAddress}
            onChange={(e) => setBtcAddress(e.target.value)}
            placeholder="Enter BTC address"
            required
          />
        </div>

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Processing...' : 'Swap Now'}
        </button>
      </form>
    </div>
  );
};
