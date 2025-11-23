# Cryptoon 

**Web3 manga/webtoon reader with zero-commission payments for creators, powered by Coinbase AgentKit**

![Cryptoon Demo](https://img.shields.io/badge/Status-Hackathon%20Ready-green) ![CDP](https://img.shields.io/badge/Coinbase-CDP-blue) ![Base](https://img.shields.io/badge/Network-Base%20Sepolia-lightblue)

---

## Problem Statement

Traditional webtoon/manga platforms take **30-50% commission** from creators. Small creators struggle with:
- High platform fees eating into revenue
- No control over pricing
- Delayed payments (30-90 days)
- Geographic payment restrictions

## Our Solution

Cryptoon is a **Web3 manga/webtoon reader** designed for the community and creators:

- **Free to read** - First chapters are completely free for everyone  
- **Support your favorite artists** - Latest chapter requires payment (0.01 USDC)  
- **Zero commission** - Creators keep 100% of revenue  
- **Instant settlement** - Payments arrive in seconds, not months  
- **Global access** - No geographic restrictions with USDC  
- **Autonomous payments** - AgentKit auto-purchases new chapters  
- **Transparent** - All transactions verifiable on-chain  

**Not a marketplace** - We're a reader platform focused on supporting artists without privatizing content. Read for free, pay to support!  

---

## Architecture

```mermaid
graph TD
    Reader[Reader<br/>Client]
    
    Reader -->|CDP Embedded Wallet<br/>Login| Auth{Authentication}
    
    Auth -->|Manual Payment| Manual[x402 Payment<br/>Manual]
    Auth -->|Automated| Agent[AgentKit<br/>Automated]
    
    Manual -->|402 Payment Required<br/>USDC Transfer| Backend
    Agent -->|Auto-purchase<br/>Scheduled checks| Backend
    
    Backend[Node.js Backend Server<br/>────────────────<br/>x402 Facilitator<br/>CDP Faucet API<br/>Token Balances<br/>Agent Wallet]
    
    Backend -->|Transaction| Blockchain[Base Sepolia<br/>Blockchain]
    
    Blockchain -->|Payment| Creator[Creator Wallet<br/>100% Revenue]
    
    style Reader fill:#e1f5ff
    style Manual fill:#fff4e6
    style Agent fill:#f3e5f5
    style Backend fill:#e8f5e9
    style Blockchain fill:#fce4ec
    style Creator fill:#fff9c4
```

---

## Coinbase Developer Platform Products Used

### Client-Side
- **CDP Embedded Wallet** - Web2-friendly auth (no seed phrases, no extensions)
- **x402 Protocol** - Seamless micropayments for content access

### Server-Side
- **AgentKit (CDP SDK v2)** - Autonomous agent for auto-purchasing chapters
- **CDP x402 Facilitator** - Payment verification and settlement
- **CDP Faucet API** - One-click testnet USDC distribution
- **CDP Token Balances API** - Real-time wallet balance tracking
- **CDP Wallet Management** - Programmatic wallet creation and transactions

---

## Features

### ✅ Implemented & Functional

#### 1. Web3 Authentication
- CDP Embedded Wallet integration
- Multiple auth methods (email, passkey, social)
- No browser extension required

#### 2. x402 Micropayments
- Pay-per-chapter model (0.01 USDC)
- HTTP 402 "Payment Required" protocol
- Instant access after payment

#### 3. AgentKit Auto-Purchase 
- Autonomous agent monitoring favorites
- Auto-purchase new premium chapters
- Monthly spending limits

#### 4. AI Recommendations
- n8n workflow integration with OpenAI
- Personalized manga/webtoon suggestions
- Webhook-triggered recommendations

![n8n Workflow](./assets/img/n8n-workflow.png)
*AI recommendation system powered by n8n + OpenAI*

![n8n Webhook Details](./assets/img/n8n-webhook-trigger-details.png)
*Webhook configuration for real-time recommendations*

#### 5. AI Chat Assistant (x402-Powered)
- Pay-per-query AI chat with manga characters
- x402 payment for external n8n webhook API calls
- Demonstrates x402 versatility:
  - ✅ **Backend APIs** - Chapter access payments
  - ✅ **External Webhooks** - n8n AI chat payments
  - ✅ **AgentKit** - Autonomous chapter purchases

**Why This Matters:**  
This feature showcases the **full versatility of x402 protocol** by implementing three distinct payment scenarios in one platform:

1. **Traditional Backend** - Direct server-to-server payments for content
2. **External Services** - Pay for third-party webhook/API calls (n8n)
3. **Autonomous Agents** - AgentKit handles payments automatically

**Use Case:** Readers can chat with their favorite manga characters (e.g., "Ask Chronos about time travel") for 0.01 USDC per message. Payment flows through x402 to cover the n8n + OpenAI API costs.

### Mockup/Simulated

- Creator Dashboard (Future: Full analytics)

---

## Quick Start

### Prerequisites

- Node.js v18+
- npm or yarn
- CDP Project from https://portal.cdp.coinbase.com/
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/hallzyx/x402-demo.git
cd x402-demo/cryptoon
```

### 2. Install Dependencies

```bash
# Install all dependencies (root, server, and client)
npm run setup

# Or manually:
cd server && npm install
cd ../client && npm install
cd ..
```

### 3. Configure Environment Variables

#### Server Configuration

```bash
cd server
cp .env.example .env
```

Edit `server/.env` with your CDP credentials:

```env
# Receiver wallet for payments
RECEIVER_WALLET=0xYourWalletAddress

# CDP API Credentials (from https://portal.cdp.coinbase.com/)
CDP_API_KEY_ID=your-uuid-key-id
CDP_API_KEY_SECRET=your-base64-secret

# CDP Wallet Secret (PEM format)
CDP_WALLET_SECRET="-----BEGIN EC PRIVATE KEY-----\nYourPrivateKey\n-----END EC PRIVATE KEY-----"

# Server port (optional)
PORT=3001
```

#### Client Configuration (Optional)

```bash
cd client
cp .env.example .env.local
```

Edit `client/.env.local` if needed:

```env
NEXT_PUBLIC_CDP_PROJECT_ID=your-cdp-project-id
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_NETWORK=base-sepolia
NEXT_PUBLIC_CHAIN_ID=84532
```

### 4. Start the Application

#### Option A: Start Both Servers Together

```bash
# From project root
npm run dev
```

This will start:
- Backend server: http://localhost:3001
- Frontend client: http://localhost:3000

#### Option B: Start Servers Separately

```bash
# Terminal 1: Start backend
cd server
npm run dev

# Terminal 2: Start frontend
cd client
npm run dev
```

### 5. Verify Installation

Run the readiness check script:

```bash
./check-readiness.sh
```

Expected output:
```
✅ Node.js version check passed
✅ npm version check passed
✅ Dependencies installed
✅ Environment files configured
✅ Security checks passed

ALL CHECKS PASSED! You're ready to go.
```

### 6. Access the Application

Open your browser and navigate to:
- **Frontend:** http://localhost:3000
- **Admin Dashboard:** http://localhost:3000/admin
- **API Health Check:** http://localhost:3001/health

---

## Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Complete technical documentation, payment flows, and CDP integration details
- **[CHECKLIST.md](./CHECKLIST.md)** - Pre-hackathon verification checklist and testing guide
- **check-readiness.sh** - Automated verification script

---

## Implementation Status

| Feature | Status |
|---------|--------|
| CDP Wallet Auth | ✅ Functional |
| x402 Payments | ✅ Functional |
| AgentKit Auto-Purchase | ✅ Functional |
| Faucet System | ✅ Functional |
| AI Recommendations (n8n + OpenAI) | ✅ Functional |
| AI Chat Assistant (x402 + n8n) | ✅ Functional |
| Creator Dashboard | ❌ Mock |

---

## x402 Protocol Versatility

Cryptoon demonstrates **three distinct use cases** for x402 micropayments:

### 1. Backend Content Access
- **Use Case:** Pay to unlock latest manga chapters
- **Flow:** User → x402 → Backend API → Content
- **Price:** 0.01 USDC per chapter

### 2. External Webhook Services  
- **Use Case:** AI Chat with manga characters (n8n + OpenAI)
- **Flow:** User → x402 → n8n Webhook → OpenAI → Response
- **Price:** 0.01 USDC per message
- **Why x402?** Covers external API costs (n8n hosting + OpenAI tokens)

### 3. Autonomous Agent Payments
- **Use Case:** AgentKit auto-purchases new chapters
- **Flow:** Agent → x402 → Backend → Chapter unlocked
- **Price:** 0.01 USDC per auto-purchase
- **Why x402?** Agent can execute payments without user approval

---

## Important Links

- **USDC Contract**: 0x036CbD53842c5426634e7929541eC2318f3dCF7e
- **Network**: Base Sepolia (Chain ID: 84532)
- **Explorer**: https://sepolia.basescan.org/

---

## Roadmap

### Phase 1: Hackathon MVP ✅
- [x] CDP Wallet + x402 + AgentKit

### Phase 2: Post-Hackathon
- [ ] AI recommendations
- [ ] Multi-creator support
- [ ] IPFS integration

### Phase 3: Production
- [ ] Mainnet deployment
- [ ] Database migration
- [ ] Mobile app

---

## License

MIT License

---

**Built for creators. Powered by Coinbase. Zero commission. Forever.**
