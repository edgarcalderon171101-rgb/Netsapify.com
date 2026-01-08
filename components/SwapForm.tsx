import { FC, useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import axios from 'axios';

export const SwapForm: FC = () => {
  const { publicKey } = useWallet();
  const [creditsAmount, setCreditsAmount] = useState('');
  const [btcAddress, setBtcAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [estimatedFees, setEstimatedFees] = useState<{
    swapFee: number;
    networkFee: number;
    totalFees: number;
    feePercentage: number;
    totalRequired: number;
  } | null>(null);
  const [result, setResult] = useState<{
    transactionId?: string;
    status?: string;
    solSignature?: string;
    bridgeTransactionId?: string;
    estimatedTime?: number;
    fees?: {
      swapFee: number;
      networkFee: number;
      totalFees: number;
      feePercentage: number;
    };
    amounts?: {
      creditsAmount: number;
      totalCreditsCharged: number;
      solAmount: number;
    };
  } | null>(null);
  const [error, setError] = useState('');

  // Calculate estimated fees when credits amount changes
  useEffect(() => {
    const amount = parseFloat(creditsAmount);
    if (amount > 0) {
      // Calculate fees (15% swap fee + 2 credits network fee)
      const swapFeePercentage = 15;
      let swapFee = Math.ceil((amount * swapFeePercentage) / 100);
      if (swapFee < 5) swapFee = 5; // Minimum 5 credits
      const networkFee = 2;
      const totalFees = swapFee + networkFee;
      const totalRequired = amount + totalFees;
      
      setEstimatedFees({
        swapFee,
        networkFee,
        totalFees,
        feePercentage: (totalFees / amount) * 100,
        totalRequired,
      });
    } else {
      setEstimatedFees(null);
    }
  }, [creditsAmount]);

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
      setEstimatedFees(null);
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
          {result.fees && (
            <div className="fee-details">
              <h4>Fees Charged:</h4>
              <p>Swap Fee: {result.fees.swapFee} credits ({result.fees.feePercentage.toFixed(1)}%)</p>
              <p>Network Fee: {result.fees.networkFee} credits</p>
              <p><strong>Total Fees: {result.fees.totalFees} credits</strong></p>
            </div>
          )}
          {result.amounts && (
            <div className="amount-details">
              <p>Credits Swapped: {result.amounts.creditsAmount}</p>
              <p>Total Charged: {result.amounts.totalCreditsCharged} credits</p>
              <p>SOL Received: {result.amounts.solAmount.toFixed(6)} SOL</p>
            </div>
          )}
          {result.solSignature && <p className="signature">SOL Tx: {result.solSignature.substring(0, 20)}...</p>}
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
          {estimatedFees && (
            <div className="fee-estimate">
              <p className="fee-warning">⚠️ High transaction fees apply</p>
              <p>Swap Fee: {estimatedFees.swapFee} credits (15%)</p>
              <p>Network Fee: {estimatedFees.networkFee} credits</p>
              <p><strong>Total Fees: {estimatedFees.totalFees} credits</strong></p>
              <p className="total-required">
                <strong>Total Required: {estimatedFees.totalRequired} credits</strong>
              </p>
            </div>
          )}
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
