# Setup & Testing Guide

## Initial Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Environment File
Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

### 3. Generate Admin Wallet (for testing)
```javascript
// Run in Node.js or browser console
const { Keypair } = require('@solana/web3.js');
const bs58 = require('bs58');

const keypair = Keypair.generate();
console.log('Public Key:', keypair.publicKey.toBase58());
console.log('Secret Key:', bs58.encode(keypair.secretKey));
```

Add these values to your `.env.local`:
```env
ADMIN_WALLET_ADDRESS=<public_key_from_above>
ADMIN_SECRET_KEY=<secret_key_from_above>
```

### 4. Fund Admin Wallet (Devnet)
Visit https://faucet.solana.com/ and request devnet SOL for your admin wallet address.

## Testing Locally

### 1. Start Development Server
```bash
npm run dev
```

### 2. Open Browser
Navigate to http://localhost:3000

### 3. Add Test Credits (as Admin)
Use the API endpoint to add credits:

```bash
curl -X POST http://localhost:3000/api/credits?walletAddress=<user_wallet_address> \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "adminWallet": "<your_admin_wallet_address>"
  }'
```

### 4. Test the Swap Flow
1. Connect your Phantom wallet (make sure it's on devnet)
2. Check your credit balance
3. Enter credits amount and a BTC address
4. Click "Swap Now"
5. Approve the transaction in your wallet
6. Check transaction status

## Testing with Phantom Wallet

### 1. Install Phantom
Download from https://phantom.app/

### 2. Switch to Devnet
- Open Phantom
- Settings → Change Network → Devnet

### 3. Get Test SOL (optional, for receiving)
Visit https://faucet.solana.com/ and request devnet SOL

## API Testing

### Get Credit Balance
```bash
curl http://localhost:3000/api/credits?walletAddress=<wallet_address>
```

### Add Credits (Admin Only)
```bash
curl -X POST http://localhost:3000/api/credits?walletAddress=<wallet_address> \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "adminWallet": "<admin_wallet>"
  }'
```

### Initiate Swap
```bash
curl -X POST http://localhost:3000/api/swap \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "<user_wallet>",
    "creditsAmount": 10,
    "btcAddress": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
  }'
```

### Check Transaction Status
```bash
curl http://localhost:3000/api/status?transactionId=<transaction_id>
```

### Get Transactions
```bash
curl http://localhost:3000/api/transactions?walletAddress=<wallet_address>
```

## Deploying to Netlify

### 1. Push to GitHub
```bash
git push origin main
```

### 2. Connect to Netlify
1. Go to https://app.netlify.com/
2. Click "New site from Git"
3. Choose your repository
4. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`

### 3. Add Environment Variables
In Netlify Dashboard → Site Settings → Build & Deploy → Environment variables:
- `NEXT_PUBLIC_SOLANA_NETWORK=devnet` (or mainnet-beta)
- `NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com`
- `ADMIN_WALLET_ADDRESS=<your_admin_wallet>`
- `ADMIN_SECRET_KEY=<your_admin_secret>`
- `BRIDGE_API_KEY=<your_bridge_api_key>`
- `BRIDGE_API_URL=<your_bridge_api_url>`
- `CREDIT_TO_SOL_RATE=0.001`
- `MIN_WITHDRAWAL_AMOUNT=10`
- `MAX_WITHDRAWAL_AMOUNT=10000`

### 4. Deploy
Click "Deploy site"

## Deploying to Vercel

### 1. Push to GitHub
```bash
git push origin main
```

### 2. Import to Vercel
1. Go to https://vercel.com/
2. Click "Import Project"
3. Choose your repository
4. Framework will be auto-detected as Next.js

### 3. Add Environment Variables
In Project Settings → Environment Variables, add the same variables as Netlify.

### 4. Deploy
Click "Deploy"

## Production Considerations

### 1. Use Mainnet
Update environment variables:
```env
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

### 2. Fund Admin Wallet
Transfer real SOL to your admin wallet for processing swaps.

### 3. Configure Bridge Provider
Replace the mock bridge service with a real provider:
- Wormhole: https://wormhole.com/
- Allbridge: https://allbridge.io/
- Portal Bridge: https://portalbridge.com/

Update `BRIDGE_API_KEY` and `BRIDGE_API_URL` accordingly.

### 4. Add Database
Replace in-memory storage with a real database:
- PostgreSQL
- MongoDB
- Supabase
- Firebase

### 5. Add Rate Limiting
Implement rate limiting on API routes to prevent abuse.

### 6. Add Authentication
Implement proper user authentication for managing credits.

### 7. Security Audit
Perform a security audit before production deployment.

## Troubleshooting

### Build Fails
- Run `npm install` again
- Check Node.js version (should be 18+)
- Clear `.next` folder: `rm -rf .next`

### Wallet Won't Connect
- Make sure Phantom is installed
- Check network (devnet vs mainnet)
- Clear browser cache

### Transaction Fails
- Check admin wallet has sufficient SOL
- Verify admin secret key is correct
- Check Solana network status

### API Errors
- Check environment variables are set correctly
- Verify admin wallet address format
- Check API logs in deployment platform

## Security Notes

⚠️ **IMPORTANT**: Never commit your `.env.local` file or expose your admin secret key!

- Add `.env.local` to `.gitignore` (already done)
- Use environment variables in production
- Rotate keys regularly
- Monitor transactions for suspicious activity
- Implement withdrawal limits
- Add 2FA for admin operations (in production)
