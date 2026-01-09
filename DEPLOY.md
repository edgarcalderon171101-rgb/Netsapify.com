# Quick Deployment Guide

## 🚀 Deploy in 5 Minutes

### Prerequisites
- GitHub account
- Netlify or Vercel account
- Solana wallet with SOL for admin operations
- Bridge provider API key (optional for testing)

---

## Option 1: Deploy to Netlify

### Step 1: Push to GitHub
```bash
git push origin main
```

### Step 2: Connect Repository
1. Go to https://app.netlify.com/
2. Click **"New site from Git"**
3. Choose **GitHub** and authorize
4. Select your **Netsapify.com** repository
5. Click **"Deploy site"**

### Step 3: Configure Environment Variables
In Netlify Dashboard:
1. Go to **Site settings** → **Build & deploy** → **Environment variables**
2. Add the following variables:

```
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
ADMIN_WALLET_ADDRESS=<your_admin_public_key>
ADMIN_SECRET_KEY=<your_admin_secret_key>
BRIDGE_API_KEY=<your_bridge_key>
BRIDGE_API_URL=<your_bridge_url>
CREDIT_TO_SOL_RATE=0.001
MIN_WITHDRAWAL_AMOUNT=10
MAX_WITHDRAWAL_AMOUNT=10000
```

### Step 4: Redeploy
1. Go to **Deploys** tab
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Wait for build to complete
4. Your site is live! 🎉

---

## Option 2: Deploy to Vercel

### Step 1: Push to GitHub
```bash
git push origin main
```

### Step 2: Import Project
1. Go to https://vercel.com/
2. Click **"Import Project"**
3. Choose **GitHub** and authorize
4. Select your **Netsapify.com** repository
5. Framework preset will auto-detect as **Next.js**

### Step 3: Configure Environment Variables
Before deploying:
1. Expand **"Environment Variables"** section
2. Add the same variables as Netlify (see above)

### Step 4: Deploy
1. Click **"Deploy"**
2. Wait for build to complete
3. Your site is live! 🎉

---

## Post-Deployment Setup

### 1. Fund Admin Wallet
Transfer SOL to your admin wallet for processing swaps:

**Devnet:**
```
Visit: https://faucet.solana.com/
Enter your admin wallet address
Request devnet SOL
```

**Mainnet:**
```
Transfer real SOL from your personal wallet
Recommended: Start with 1-5 SOL
```

### 2. Add Test Credits
For testing, add credits to a user wallet:

```bash
curl -X POST https://your-domain.com/api/credits?walletAddress=<user_wallet> \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "adminWallet": "<your_admin_wallet>"
  }'
```

### 3. Test the Flow
1. Open your deployed site
2. Connect Phantom wallet
3. Enter BTC address and credits amount
4. Click "Swap Now"
5. Approve transaction in wallet
6. Monitor transaction status

---

## Custom Domain Setup

### Netlify
1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Enter your domain name
4. Follow DNS configuration instructions

### Vercel
1. Go to **Settings** → **Domains**
2. Enter your domain name
3. Follow DNS configuration instructions

---

## Production Checklist

Before going live with real funds:

- [ ] Test with devnet thoroughly
- [ ] Integrate real bridge provider (not mock)
- [ ] Replace in-memory storage with database
- [ ] Add rate limiting to API routes
- [ ] Implement monitoring and alerting
- [ ] Set up error tracking (Sentry, LogRocket)
- [ ] Configure proper CORS settings
- [ ] Add SSL certificate (automatic with Netlify/Vercel)
- [ ] Set withdrawal limits appropriately
- [ ] Test with small amounts first
- [ ] Have customer support ready
- [ ] Prepare incident response plan

---

## Bridge Provider Integration

### Option 1: Wormhole
```bash
# Get API key from https://wormhole.com/
BRIDGE_API_KEY=your_wormhole_key
BRIDGE_API_URL=https://api.wormhole.com/v1
```

### Option 2: Allbridge
```bash
# Get API key from https://allbridge.io/
BRIDGE_API_KEY=your_allbridge_key
BRIDGE_API_URL=https://api.allbridge.io/v1
```

### Option 3: Portal Bridge
```bash
# Get API key from https://portalbridge.com/
BRIDGE_API_KEY=your_portal_key
BRIDGE_API_URL=https://api.portalbridge.com/v1
```

Then update `/lib/bridge.ts` to match the provider's API structure.

---

## Monitoring Your Deployment

### Check Build Logs
**Netlify:** Deploy logs → View build logs
**Vercel:** Deployments → Click deployment → View logs

### Check Function Logs
**Netlify:** Functions tab → View logs
**Vercel:** Deployments → Functions → View logs

### Monitor Errors
Add error tracking:
```bash
npm install @sentry/nextjs
# Configure in next.config.js
```

---

## Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
Netlify: Settings → Build & deploy → Clear cache
Vercel: Deployments → Click ⋯ → Redeploy → Clear cache
```

### Environment Variables Not Working
- Check spelling and format
- Redeploy after changing variables
- Use `NEXT_PUBLIC_` prefix for client-side variables

### Transaction Fails
- Verify admin wallet has sufficient SOL
- Check admin secret key is correct
- Test on devnet first
- Check Solana network status: https://status.solana.com/

### Wallet Won't Connect
- User must have Phantom installed
- Check network matches (devnet vs mainnet)
- Clear browser cache
- Try incognito mode

---

## Scaling for Production

### Database Migration
Replace in-memory storage with PostgreSQL:

```bash
npm install pg
# Update /lib/storage.ts to use database
```

### Add Caching
```bash
npm install redis
# Cache credit balances and transaction status
```

### Load Balancing
Both Netlify and Vercel automatically handle this.

### Rate Limiting
```bash
npm install express-rate-limit
# Add to API routes
```

---

## Security Best Practices

1. **Never commit** `.env.local` file
2. **Rotate** admin keys regularly
3. **Monitor** transactions for suspicious activity
4. **Limit** withdrawal amounts appropriately
5. **Enable** 2FA on deployment platform
6. **Backup** database regularly
7. **Update** dependencies frequently
8. **Audit** code before production

---

## Support

For issues:
1. Check SETUP.md for detailed instructions
2. Check API.md for API documentation
3. Check SUMMARY.md for architecture overview
4. Review build logs for errors
5. Test locally first: `npm run dev`

---

## Cost Estimates

### Netlify Free Tier
- 100 GB bandwidth
- 300 build minutes/month
- Sufficient for testing

### Vercel Free Tier
- 100 GB bandwidth
- Serverless functions included
- Sufficient for testing

### Production Costs
- Solana transactions: ~0.000005 SOL each
- Bridge fees: Varies by provider (1-3%)
- Hosting: $0-20/month depending on traffic
- Database: $10-30/month for PostgreSQL

---

## Next Steps

1. ✅ Deploy to Netlify or Vercel
2. ✅ Configure environment variables
3. ✅ Fund admin wallet
4. ✅ Test with devnet
5. 🔄 Integrate real bridge provider
6. 🔄 Add database
7. 🔄 Test with small amounts
8. 🚀 Go live!

**You're ready to ship! 🚀**
