# API Documentation

## Overview
The Netsapify API provides endpoints for managing credits, processing swaps, and monitoring transactions.

## Base URL
- Development: `http://localhost:3000`
- Production: `https://your-domain.com`

## Authentication
Most endpoints require wallet address verification. Admin endpoints require the admin wallet address to match the configured admin wallet.

---

## Endpoints

### 1. Credits Management

#### GET /api/credits
Get credit balance for a wallet address.

**Query Parameters:**
- `walletAddress` (required): Solana wallet address

**Response:**
```json
{
  "walletAddress": "AbC123...",
  "credits": 100,
  "lastUpdated": "2024-01-08T10:00:00.000Z"
}
```

**Example:**
```bash
curl "http://localhost:3000/api/credits?walletAddress=AbC123..."
```

---

#### POST /api/credits
Add or remove credits (Admin only).

**Query Parameters:**
- `walletAddress` (required): Target wallet address

**Request Body:**
```json
{
  "amount": 100,
  "adminWallet": "admin_wallet_address"
}
```

**Response:**
```json
{
  "walletAddress": "AbC123...",
  "credits": 200,
  "lastUpdated": "2024-01-08T10:00:00.000Z"
}
```

**Notes:**
- Use negative amount to deduct credits
- Only the configured admin wallet can modify credits

---

### 2. Swap Operations

#### POST /api/swap
Initiate a swap from credits to SOL to BTC.

**Request Body:**
```json
{
  "walletAddress": "user_wallet_address",
  "creditsAmount": 10,
  "btcAddress": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
}
```

**Response:**
```json
{
  "transactionId": "tx_1234567890_abcdef",
  "status": "processing",
  "solSignature": "4uQeVj5...",
  "bridgeTransactionId": "bridge_1234567890_xyz",
  "estimatedTime": 600,
  "message": "Swap initiated successfully"
}
```

**Validation:**
- User must have sufficient credits
- Credits amount must be within min/max limits
- BTC address must be valid
- Transaction value must match exchange rate

---

### 3. Transaction Monitoring

#### GET /api/status
Check the status of a specific transaction.

**Query Parameters:**
- `transactionId` (required): Transaction ID from swap response

**Response:**
```json
{
  "id": "tx_1234567890_abcdef",
  "userId": "user_wallet",
  "walletAddress": "AbC123...",
  "creditsAmount": 10,
  "solAmount": 0.01,
  "btcAmount": 0.00012,
  "btcAddress": "bc1q...",
  "status": "completed",
  "solSignature": "4uQeVj5...",
  "bridgeTransactionId": "bridge_1234567890_xyz",
  "createdAt": "2024-01-08T10:00:00.000Z",
  "updatedAt": "2024-01-08T10:10:00.000Z"
}
```

**Transaction Statuses:**
- `pending`: Transaction created, awaiting processing
- `credits_to_sol`: Credits swapped to SOL, awaiting bridge
- `sol_to_btc`: SOL being bridged to BTC
- `completed`: BTC successfully sent
- `failed`: Transaction failed (credits refunded)

---

#### GET /api/transactions
Get transaction history for a wallet.

**Query Parameters:**
- `walletAddress` (required): Wallet address to query
- `adminWallet` (optional): Admin wallet for viewing all transactions

**Response:**
```json
{
  "transactions": [
    {
      "id": "tx_1234567890_abcdef",
      "walletAddress": "AbC123...",
      "creditsAmount": 10,
      "solAmount": 0.01,
      "btcAddress": "bc1q...",
      "status": "completed",
      "solSignature": "4uQeVj5...",
      "bridgeTransactionId": "bridge_123",
      "createdAt": "2024-01-08T10:00:00.000Z",
      "updatedAt": "2024-01-08T10:10:00.000Z"
    }
  ]
}
```

**Admin View:**
- If `adminWallet` matches admin address, returns all transactions
- Can filter by `walletAddress` parameter

---

### 4. Admin Configuration

#### GET /api/admin
Get current admin configuration (Admin only).

**Query Parameters:**
- `adminWallet` (required): Admin wallet address

**Response:**
```json
{
  "creditToSolRate": 0.001,
  "minWithdrawalAmount": 10,
  "maxWithdrawalAmount": 10000
}
```

---

#### POST /api/admin
Update admin configuration (Admin only).

**Query Parameters:**
- `adminWallet` (required): Admin wallet address

**Response:**
```json
{
  "message": "Admin configuration is set via environment variables",
  "currentConfig": {
    "creditToSolRate": 0.001,
    "minWithdrawalAmount": 10,
    "maxWithdrawalAmount": 10000
  }
}
```

**Note:** Currently, configuration is managed via environment variables and cannot be changed at runtime for security reasons.

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "error": "Error message",
  "message": "Detailed error information"
}
```

### Common HTTP Status Codes
- `200`: Success
- `400`: Bad Request (validation error)
- `403`: Forbidden (unauthorized)
- `404`: Not Found
- `405`: Method Not Allowed
- `500`: Internal Server Error

### Common Error Messages
- `"Wallet address is required"`
- `"Insufficient credits"`
- `"Invalid Bitcoin address"`
- `"Amount must be greater than 0"`
- `"Minimum withdrawal amount is X credits"`
- `"Maximum withdrawal amount is X credits"`
- `"Unauthorized - admin only"`
- `"Transaction value mismatch"`

---

## Rate Limiting

Currently, there is no rate limiting implemented. In production, consider adding:
- Per-IP rate limits
- Per-wallet rate limits
- Admin bypass for monitoring

---

## Webhooks (Future Enhancement)

Future versions may support webhooks for transaction status updates:
```json
{
  "event": "transaction.completed",
  "transactionId": "tx_123",
  "status": "completed",
  "timestamp": "2024-01-08T10:10:00.000Z"
}
```

---

## SDK Examples

### JavaScript/TypeScript
```typescript
import axios from 'axios';

// Get credits
const balance = await axios.get('/api/credits', {
  params: { walletAddress: 'user_wallet' }
});

// Initiate swap
const swap = await axios.post('/api/swap', {
  walletAddress: 'user_wallet',
  creditsAmount: 10,
  btcAddress: 'bc1q...'
});

// Check status
const status = await axios.get('/api/status', {
  params: { transactionId: swap.data.transactionId }
});
```

### Python
```python
import requests

# Get credits
response = requests.get('http://localhost:3000/api/credits', 
    params={'walletAddress': 'user_wallet'})
balance = response.json()

# Initiate swap
response = requests.post('http://localhost:3000/api/swap', json={
    'walletAddress': 'user_wallet',
    'creditsAmount': 10,
    'btcAddress': 'bc1q...'
})
swap = response.json()

# Check status
response = requests.get('http://localhost:3000/api/status',
    params={'transactionId': swap['transactionId']})
status = response.json()
```

---

## Security Considerations

1. **API Keys**: Not currently implemented. Consider adding API key authentication for production.

2. **CORS**: Configure CORS headers appropriately for your domain.

3. **Input Validation**: All inputs are validated on the server side.

4. **Admin Operations**: Only the configured admin wallet can perform administrative actions.

5. **Transaction Verification**: All on-chain transactions are verified via Solana signatures.

6. **Rate Limiting**: Should be implemented in production to prevent abuse.

---

## Testing

Use the provided curl examples or import the following Postman collection:

```json
{
  "info": {
    "name": "Netsapify API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get Credits",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/api/credits?walletAddress={{userWallet}}"
      }
    },
    {
      "name": "Initiate Swap",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/api/swap",
        "body": {
          "mode": "raw",
          "raw": "{\n  \"walletAddress\": \"{{userWallet}}\",\n  \"creditsAmount\": 10,\n  \"btcAddress\": \"bc1q...\"\n}"
        }
      }
    }
  ]
}
```
