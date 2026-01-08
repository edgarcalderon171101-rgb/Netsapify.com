import Head from 'next/head';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { CreditDisplay } from '../components/CreditDisplay';
import { SwapForm } from '../components/SwapForm';
import { TransactionHistory } from '../components/TransactionHistory';

export default function Home() {
  return (
    <>
      <Head>
        <title>Netsapify - Real Solana to BTC Swap</title>
        <meta name="description" content="Real swap and send system using official Solana and BTC rails" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="container">
        <header className="header">
          <h1>Netsapify</h1>
          <p className="subtitle">Real Solana to BTC Swap & Send</p>
          <WalletMultiButton />
        </header>

        <div className="content">
          <div className="main-section">
            <CreditDisplay />
            <SwapForm />
          </div>
          
          <div className="sidebar">
            <TransactionHistory />
          </div>
        </div>

        <footer className="footer">
          <p>Using official Solana + BTC rails with wallet signing</p>
          <p>Admin-controlled credits and withdrawal limits</p>
        </footer>
      </main>
    </>
  );
}
