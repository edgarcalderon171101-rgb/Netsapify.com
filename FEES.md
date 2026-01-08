# Transaction Fee System

## Overview
Netsapify implements a **high transaction fee system** where fees are deducted from user credits **before** the swap occurs. This ensures all fees are collected upfront and transparently displayed to users.

## Fee Structure

### Fee Components

1. **Swap Fee (15% default)**
   - Percentage-based fee on the transaction amount
   - Configurable via `SWAP_FEE_PERCENTAGE` environment variable
   - Example: 100 credits × 15% = 15 credits

2. **Minimum Fee Floor (5 credits)**
   - If calculated swap fee is less than 5 credits, it's raised to 5
   - Ensures minimum revenue per transaction
   - Configurable via `MIN_FEE_CREDITS` environment variable

3. **Network/Gas Fee (2 credits fixed)**
   - Fixed fee per transaction for network costs
   - Covers Solana transaction fees
   - Configurable via `NETWORK_FEE_CREDITS` environment variable

### Fee Calculation Formula

```typescript
swapFee = max(creditsAmount × 15%, 5)
networkFee = 2
totalFees = swapFee + networkFee
totalRequired = creditsAmount + totalFees
```

## Examples

### Example 1: Standard Transaction
- **Credits to swap:** 100
- **Swap fee:** 15 credits (15%)
- **Network fee:** 2 credits
- **Total fees:** 17 credits
- **Total required:** 117 credits
- **You receive:** 0.1 SOL (100 × 0.001)
- **Admin keeps:** 17 credits

### Example 2: Small Transaction (Minimum Fee)
- **Credits to swap:** 20
- **Calculated swap fee:** 3 credits (15% of 20)
- **Applied swap fee:** 5 credits (minimum floor)
- **Network fee:** 2 credits
- **Total fees:** 7 credits
- **Total required:** 27 credits
- **You receive:** 0.02 SOL (20 × 0.001)
- **Admin keeps:** 7 credits

### Example 3: Large Transaction
- **Credits to swap:** 1000
- **Swap fee:** 150 credits (15%)
- **Network fee:** 2 credits
- **Total fees:** 152 credits
- **Total required:** 1152 credits
- **You receive:** 1.0 SOL (1000 × 0.001)
- **Admin keeps:** 152 credits

## User Experience

### Frontend Fee Display

1. **Real-time Calculation**
   - Fees calculated as user types
   - Displayed immediately below amount field
   - Warning shown: "⚠️ High transaction fees apply"

2. **Fee Breakdown**
   ```
   Swap Fee: 15 credits (15%)
   Network Fee: 2 credits
   Total Fees: 17 credits
   ------------------------
   Total Required: 117 credits
   ```

3. **Transaction Confirmation**
   - Full fee details shown in result
   - Breakdown of what was charged
   - Clear display of SOL received

### Error Messages

If insufficient credits:
```json
{
  "error": "Insufficient credits. Required: 117 (100 + 17 fees), Available: 100",
  "fees": {
    "swapFee": 15,
    "networkFee": 2,
    "totalFees": 17
  }
}
```

## API Integration

### Swap Request
```bash
POST /api/swap
{
  "walletAddress": "user_wallet",
  "creditsAmount": 100,
  "btcAddress": "bc1q..."
}
```

### Success Response
```json
{
  "transactionId": "tx_...",
  "status": "processing",
  "fees": {
    "swapFee": 15,
    "networkFee": 2,
    "totalFees": 17,
    "feePercentage": 17
  },
  "amounts": {
    "creditsAmount": 100,
    "totalCreditsCharged": 117,
    "solAmount": 0.1
  },
  "solSignature": "...",
  "bridgeTransactionId": "..."
}
```

## Transaction Flow

1. **User Input**
   - User enters: 100 credits
   - System calculates: 117 credits required

2. **Validation**
   - Check user has ≥ 117 credits
   - Validate addresses and amounts
   - Show fee breakdown

3. **Credit Deduction**
   - Deduct 117 credits from user balance
   - Credits breakdown:
     - 100 → swapped to SOL
     - 17 → kept as fees

4. **On-Chain Swap**
   - Transfer 0.1 SOL to user
   - SOL calculated from 100 credits (not 117)
   - Fees stay with admin

5. **Bridge to BTC**
   - Bridge the 0.1 SOL to BTC
   - User receives BTC equivalent
   - Transaction complete

## Configuration

### Environment Variables

```env
# Fee Configuration
SWAP_FEE_PERCENTAGE=15        # Percentage fee (default: 15%)
MIN_FEE_CREDITS=5             # Minimum fee floor (default: 5)
NETWORK_FEE_CREDITS=2         # Network fee (default: 2)
```

### Adjusting Fees

**To increase fees:**
```env
SWAP_FEE_PERCENTAGE=20        # 20% swap fee
MIN_FEE_CREDITS=10            # 10 credits minimum
NETWORK_FEE_CREDITS=5         # 5 credits network fee
```

**To decrease fees:**
```env
SWAP_FEE_PERCENTAGE=10        # 10% swap fee
MIN_FEE_CREDITS=3             # 3 credits minimum
NETWORK_FEE_CREDITS=1         # 1 credit network fee
```

## Fee Revenue Tracking

### Transaction History
Every transaction stores fee details:
```typescript
{
  creditsAmount: 100,
  swapFee: 15,
  networkFee: 2,
  totalFees: 17,
  totalCreditsCharged: 117,
  solAmount: 0.1
}
```

### Admin View
Admin can view:
- Total fees collected per transaction
- Fee breakdown (swap vs network)
- Total revenue across all transactions
- Fee percentage applied

## Security

### Fee Integrity
- Fees calculated server-side (not client-side)
- No way to bypass fee calculation
- Transaction value validation includes fees
- Rollback includes full amount (credits + fees)

### Transparency
- All fees shown upfront
- Clear breakdown in UI
- Fees tracked in transaction history
- No hidden charges

## Future Enhancements

### Dynamic Fees
- Volume-based discounts
- Time-based fee adjustments
- Promotional fee reductions
- Loyalty program discounts

### Fee Splitting
- Revenue sharing with partners
- Referral fee distribution
- Staking rewards from fees
- Liquidity provider incentives

## FAQ

**Q: Why are fees so high?**
A: The 15% fee covers platform operation, blockchain transaction costs, bridge fees, and ensures sustainable operations.

**Q: Are fees negotiable?**
A: Fees are set by configuration. For high-volume users, contact admin about custom rates.

**Q: What if transaction fails?**
A: All credits including fees are refunded if transaction fails.

**Q: Can I see fee history?**
A: Yes, all transactions show complete fee breakdown in transaction history.

**Q: Are fees taken in SOL or credits?**
A: Fees are deducted from your credit balance before conversion to SOL. The full requested credit amount is swapped to SOL.
