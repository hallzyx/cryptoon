# Architecture Documentation

## System Overview

Cryptoon is a decentralized manga/webtoon marketplace built on Base Sepolia using Coinbase Developer Platform.

---

## Component Architecture

### Frontend (Next.js 14 + TypeScript)

```
client/
├── app/
│   ├── page.tsx              # Homepage with series browsing
│   ├── layout.tsx            # Root layout with CDP provider
│   ├── providers.tsx         # CDP Embedded Wallet config
│   ├── settings/page.tsx     # AgentKit configuration UI
│   └── admin/page.tsx        # Testing & monitoring dashboard
├── public/                   # Static assets
└── package.json
```

**Key Dependencies:**
- `@coinbase/cdp-hooks` - React hooks for CDP integration
- `@coinbase/wallet-sdk` - Wallet connectivity
- `next` - React framework
- `tailwindcss` - Styling

**Authentication Flow:**
1. User clicks "Login with CDP"
2. CDP Embedded Wallet modal opens
3. User chooses auth method (email/passkey/social)
4. Wallet created automatically (no seed phrases)
5. Session persisted via CDP hooks

---

### Backend (Node.js + Express)

```
server/
├── index.js              # Main server + x402 endpoints
├── agentWallet.js        # CDP SDK v2 wallet management
├── agentService.js       # Auto-purchase scheduler
├── faucet.js             # CDP Faucet API integration
├── balances.js           # CDP Token Balances API
├── chapters.js           # Content & purchase logic
├── agentSettings.json    # Agent configuration storage
├── agentHistory.json     # Agent purchase history
├── purchases.json        # Manual purchase records
├── favorites.json        # User favorites tracking
└── agentWalletData.json  # Persistent agent wallet (gitignored)
```

**Key Dependencies:**
- `@coinbase/cdp-sdk` - CDP Platform SDK v2
- `viem` - Ethereum utilities (ERC-20 encoding)
- `express` - HTTP server
- `cors` - CORS middleware

---

## Payment Flows

### 1. Manual x402 Payment

```
User → Frontend
  ↓
  Clicks "Read Premium Chapter"
  ↓
Frontend → Backend (GET /api/chapters/:seriesId/:chapterId)
  ↓
Backend checks if purchased
  ↓
  NOT PURCHASED → Returns HTTP 402 "Payment Required"
  ↓
Frontend shows payment modal
  ↓
User clicks "Pay 0.01 USDC"
  ↓
Frontend → CDP x402 facilitator
  ↓
CDP facilitator verifies & settles payment
  ↓
Backend confirms payment
  ↓
Frontend unlocks chapter ✅
```

**Technical Implementation:**
```javascript
// Backend x402 endpoint
app.get("/api/chapters/:seriesId/:chapterId", (req, res) => {
  const { address, seriesId, chapterId } = req.params;
  
  if (!hasPurchased(address, chapterId)) {
    return res.status(402).json({
      error: "Payment Required",
      price: "0.01 USDC",
      receiver: process.env.RECEIVER_WALLET
    });
  }
  
  // Return chapter content
  res.json({ title, content, images });
});
```

---

### 2. AgentKit Autonomous Payment

```
AgentService (every 60 seconds)
  ↓
Checks enabled users from agentSettings.json
  ↓
For each user:
  ↓
  Gets favorites from favorites.json
  ↓
  Finds unpurchased premium chapters
  ↓
  Validates:
    - Monthly spending limit
    - Agent wallet has sufficient USDC + ETH
  ↓
  Executes transfer via CDP SDK v2:
    - Encodes ERC-20 transfer(address, uint256)
    - Calls cdpClient.evm.sendTransaction()
  ↓
  Records purchase in agentHistory.json
  ↓
  Logs transaction hash & Basescan link ✅
```

**Technical Implementation:**
```javascript
// agentWallet.js - Transfer USDC
async function transferUSDC(to, amount) {
  // Encode ERC-20 transfer call
  const data = encodeFunctionData({
    abi: [{ 
      name: 'transfer',
      type: 'function',
      inputs: [
        { name: 'to', type: 'address' },
        { name: 'amount', type: 'uint256' }
      ]
    }],
    functionName: 'transfer',
    args: [to, parseUnits(amount, 6)] // 6 decimals for USDC
  });

  // Send transaction via CDP
  const txResult = await cdpClient.evm.sendTransaction({
    address: agentAccount.address,
    network: "base-sepolia",
    transaction: {
      to: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // USDC contract
      data: data,
      value: 0n
    }
  });

  return txResult.transactionHash;
}
```

---

## CDP Integration Details

### 1. Embedded Wallet (Client)

**File:** `client/app/providers.tsx`

```typescript
import { CdpProvider } from '@coinbase/cdp-hooks';

<CdpProvider
  projectId="your-project-id"
  chainId={84532} // Base Sepolia
>
  {children}
</CdpProvider>
```

**Authentication Methods:**
- Email + OTP
- Passkey (WebAuthn)
- Social login (Google, Apple)

**No seed phrases** - CDP manages keys securely.

---

### 2. x402 Facilitator (Server)

**File:** `server/index.js`

**Purpose:** Verifies payments and settles transactions on-chain.

**Flow:**
1. User initiates payment from frontend
2. CDP facilitator validates signature
3. Facilitator submits transaction to blockchain
4. Backend confirms payment via webhook/polling
5. Content unlocked

**Benefits:**
- No gas fees for users (CDP pays)
- Instant verification
- Automatic retry logic

---

### 3. AgentKit (CDP SDK v2)

**File:** `server/agentWallet.js`

**Initialization:**
```javascript
import { CdpClient } from '@coinbase/cdp-sdk';

const cdpClient = new CdpClient({
  apiKeyId: process.env.CDP_API_KEY_ID,
  apiKeySecret: process.env.CDP_API_KEY_SECRET,
  walletSecret: process.env.CDP_WALLET_SECRET
});

// Create or restore wallet
const agentAccount = await cdpClient.evm.createAccount({
  network: "base-sepolia"
});
```

**Capabilities:**
- Autonomous USDC transfers
- Balance checking via REST API
- Transaction signing
- Persistent wallet (saved to `agentWalletData.json`)

---

### 4. Faucet API

**File:** `server/faucet.js`

**Purpose:** Distribute testnet USDC/ETH for testing.

**Usage:**
```javascript
// Request USDC
await requestFaucet(address, apiKeyId, apiKeySecret);

// Request ETH (for gas)
await requestEthFaucet(address, apiKeyId, apiKeySecret);
```

**Rate Limits:**
- 1 USDC per request
- 10 USDC per 24 hours per address

---

### 5. Token Balances API

**File:** `server/balances.js` & `server/agentWallet.js`

**Purpose:** Query USDC balance in real-time.

**Implementation:**
```javascript
const response = await fetch(
  `https://api.cdp.coinbase.com/platform/v2/evm/token-balances/base-sepolia/${address}`,
  {
    headers: {
      'Authorization': `Bearer ${jwt}`,
      'Content-Type': 'application/json'
    }
  }
);

const data = await response.json();
const usdcBalance = data.balances.find(
  b => b.contractAddress === "0x036CbD53842c5426634e7929541eC2318f3dCF7e"
);
```

---

## Data Storage

### JSON Files (Development)

**Location:** `server/`

1. **agentSettings.json**
   ```json
   {
     "0xUserAddress": {
       "enabled": true,
       "monthlyLimit": 1.0
     }
   }
   ```

2. **agentHistory.json**
   ```json
   {
     "0xUserAddress": [
       {
         "seriesId": 1,
         "chapterId": 5,
         "timestamp": "2025-11-23T04:30:00Z",
         "amount": 0.01,
         "txHash": "0xabc123...",
         "status": "success"
       }
     ]
   }
   ```

3. **purchases.json**
   ```json
   {
     "0xUserAddress": {
       "series1_chapter5": {
         "timestamp": "2025-11-23T03:15:00Z",
         "amount": 0.01,
         "txHash": "0xdef456..."
       }
     }
   }
   ```

4. **favorites.json**
   ```json
   {
     "0xUserAddress": [1, 3, 5]
   }
   ```

5. **agentWalletData.json** (Sensitive - Gitignored)
   ```json
   {
     "address": "0xAgentAddress",
     "network": "base-sepolia",
     "createdAt": "2025-11-23T04:31:08.380Z"
   }
   ```

**Production:** Migrate to PostgreSQL/MongoDB.

---

## Security Considerations

### Sensitive Files (Must be Gitignored)

- `server/.env` - API credentials
- `server/agentWalletData.json` - Wallet keys

**Verification:**
```bash
./check-readiness.sh
```

### API Key Permissions

CDP API keys should have:
- ✅ Faucet access
- ✅ Token Balances read
- ✅ Transaction sending
- ❌ Admin operations

### Agent Wallet Funding

The agent wallet needs:
- **USDC** - For purchasing chapters (~1 USDC)
- **ETH** - For gas fees (~0.001 ETH)

**Why ETH?** Even though CDP facilitator can sponsor gas, `sendTransaction()` requires some ETH in the wallet.

---

## Testing & Monitoring

### Admin Dashboard (`/admin`)

**Features:**
- Real-time agent wallet balance (5s refresh)
- Fund agent with USDC button
- Fund agent with ETH button
- Basescan verification link
- Reset testing data button
- Purchase history viewer

**Usage:**
1. Open http://localhost:3000/admin
2. Fund agent wallet (USDC + ETH)
3. Monitor live balance updates
4. Verify transactions on Basescan
5. Reset data between tests

---

### Settings Page (`/settings`)

**Features:**
- Enable/disable auto-purchase toggle
- Monthly spending limit slider
- Purchase history with tx links
- Monthly spending progress bar

**Usage:**
1. Toggle "Enable Auto-Purchase" ON
2. Set monthly limit (default 1 USDC)
3. Mark series as favorites (⭐)
4. Agent auto-buys new chapters every 60s

---

## Network Configuration

### Base Sepolia Testnet

- **Chain ID:** 84532
- **RPC:** https://sepolia.base.org
- **Explorer:** https://sepolia.basescan.org/
- **USDC Contract:** 0x036CbD53842c5426634e7929541eC2318f3dCF7e

### Transaction Costs

- **Average Gas:** ~0.0001 ETH (~$0.0002 USD)
- **CDP Sponsored:** Gas paid by facilitator (when using x402)
- **Agent Transfers:** Requires ETH in agent wallet

---

## Deployment Considerations

### Environment Variables

**Server:**
- `RECEIVER_WALLET` - Creator wallet address
- `CDP_API_KEY_ID` - CDP API credentials
- `CDP_API_KEY_SECRET` - CDP API credentials
- `CDP_WALLET_SECRET` - Agent wallet secret
- `PORT` - Server port (default 3001)

**Client:**
- `NEXT_PUBLIC_API_URL` - Backend URL
- `NEXT_PUBLIC_CHAIN_ID` - Network chain ID

### Scaling Recommendations

1. **Database:** Migrate from JSON to PostgreSQL
2. **Storage:** Move chapter images to IPFS/Arweave
3. **Caching:** Add Redis for balance queries
4. **Monitoring:** Integrate Datadog/Sentry
5. **CI/CD:** GitHub Actions for testing

---

## Future Enhancements

### Phase 2
- [ ] AI recommendations (n8n + OpenAI)
- [ ] Multi-creator routing
- [ ] Creator analytics dashboard
- [ ] IPFS integration for images

### Phase 3
- [ ] Mainnet deployment (Base)
- [ ] Mobile responsive design
- [ ] Advanced search/filters
- [ ] Subscription tiers

### Phase 4
- [ ] Farcaster Frames integration
- [ ] Cross-chain support (Optimism, Arbitrum)
- [ ] NFT minting for collectors
- [ ] Creator DAOs for governance

---

## Troubleshooting

### Agent Not Purchasing

**Check:**
1. Is auto-purchase enabled in `/settings`?
2. Does agent wallet have USDC + ETH?
3. Are there unpurchased premium chapters?
4. Is monthly limit reached?
5. Check server logs for errors

**Logs:**
```bash
cd server && npm run dev
# Look for:
# "🛒 Attempting to purchase..."
# "✅ Transfer successful!"
# OR
# "❌ Purchase failed: ..."
```

### Payment Failures

**Common Issues:**
1. **Insufficient balance** - Fund user wallet via faucet
2. **Network congestion** - Wait and retry
3. **x402 facilitator error** - Check CDP API credentials
4. **Wrong network** - Verify Base Sepolia (Chain ID 84532)

### Basescan Verification

**View transactions:**
1. Copy wallet address
2. Go to https://sepolia.basescan.org/
3. Paste address in search
4. View transactions/token transfers

---

**Last Updated:** November 23, 2025  
**Version:** 1.0.0 (Hackathon MVP)
