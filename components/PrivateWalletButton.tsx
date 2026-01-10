import { FC } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { maskWalletAddress } from '../lib/privacy';

/**
 * Custom wallet button that masks the connected wallet address for privacy
 */
export const PrivateWalletButton: FC = () => {
  const { publicKey } = useWallet();

  // Override the button content to show masked address
  if (publicKey) {
    const maskedAddress = maskWalletAddress(publicKey.toBase58(), 4, 4);
    
    return (
      <div className="wallet-button-wrapper">
        <WalletMultiButton>
          {maskedAddress}
        </WalletMultiButton>
      </div>
    );
  }

  return <WalletMultiButton />;
};
