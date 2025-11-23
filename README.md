# Cryptoon ������

**Zero-commission Web3 marketplace for manga/webtoon creators with autonomous payments powered by Coinbase AgentKit**

![Cryptoon Demo](https://img.shields.io/badge/Status-Hackathon%20Ready-green) ![CDP](https://img.shields.io/badge/Coinbase-CDP-blue) ![Base](https://img.shields.io/badge/Network-Base%20Sepolia-lightblue)

---

## ��� Problem Statement

Traditional webtoon/manga platforms take **30-50% commission** from creators. Small creators struggle with:
- High platform fees eating into revenue
- No control over pricing
- Delayed payments (30-90 days)
- Geographic payment restrictions

## ��� Our Solution

Cryptoon is a **decentralized marketplace** that puts creators first:

✅ **Zero commission** - Creators keep 100% of revenue  
✅ **Instant settlement** - Payments arrive in seconds, not months  
✅ **Global access** - No geographic restrictions with USDC  
✅ **Autonomous payments** - AgentKit auto-purchases favorite chapters  
✅ **Transparent** - All transactions verifiable on-chain  

---

## ���️ Architecture

\`\`\`
┌─────────────┐
│   Reader    │
│  (Client)   │
└──────┬──────┘
       │ CDP Embedded Wallet (Login)
       │
       ├─────────────────────────────────────┐
       │                                     │
       v                                     v
┌──────────────┐                    ┌──────────────┐
│  x402 Payment│                    │  AgentKit    │
│   (Manual)   │                    │  (Automated) │
└──────┬───────┘                    └──────┬───────┘
       │                                    │
       │  402 Payment Required              │  Auto-purchase
       │  USDC Transfer                     │  Scheduled checks
       │                                    │  
       v                                    v
┌──────────────────────────────────────────────────┐
│            Node.js Backend Server                │
│  ┌────────────────────────────────────────────┐  │
│  │  x402 Facilitator  │  CDP Faucet API      │  │
│  │  Token Balances    │  Agent Wallet        │  │
│  └────────────────────────────────────────────┘  │
└───────────────────────┬──────────────────────────┘
                        │
                        v
              ┌──────────────────┐
              │   Base Sepolia   │
              │   (Blockchain)   │
              └──────────────────┘
                        │
                        v
              ┌──────────────────┐
              │  Creator Wallet  │
              │  (100% revenue)  │
              └──────────────────┘
\`\`\`

---

## ��� Coinbase Developer Platform Products Used

### Client-Side
- **��� CDP Embedded Wallet** - Web2-friendly auth (no seed phrases, no extensions)
- **��� x402 Protocol** - Seamless micropayments for content access

### Server-Side
- **��� AgentKit (CDP SDK v2)** - Autonomous agent for auto-purchasing chapters
- **��� CDP x402 Facilitator** - Payment verification and settlement
- **��� CDP Faucet API** - One-click testnet USDC distribution
- **��� CDP Token Balances API** - Real-time wallet balance tracking
- **⚡ CDP Wallet Management** - Programmatic wallet creation and transactions

---

## ✨ Features

### ✅ Implemented & Functional

#### 1. Web3 Authentication
- CDP Embedded Wallet integration
- Multiple auth methods (email, passkey, social)
- No browser extension required

#### 2. x402 Micropayments
- Pay-per-chapter model (0.01 USDC)
- HTTP 402 "Payment Required" protocol
- Instant access after payment

#### 3. AgentKit Auto-Purchase ��
- Autonomous agent monitoring favorites
- Auto-purchase new premium chapters
- Monthly spending limits

### ��� Mockup/Simulated

- AI Recommendations (Future: n8n + OpenAI)
- Rankings/Leaderboard (Future: On-chain analytics)
- Creator Dashboard (Future: Full analytics)

---

## ��� Quick Start

### Prerequisites

- Node.js v18+
- CDP Project from https://portal.cdp.coinbase.com/

### Installation

\`\`\`bash
# Install all dependencies
npm run setup

# Or manually:
cd server && npm install
cd ../client && npm install
\`\`\`

### Configuration

1. Server setup:
\`\`\`bash
cd server
cp .env.example .env
# Edit .env with your CDP credentials
\`\`\`

2. Client setup:
\`\`\`bash
cd client
cp .env.example .env.local
\`\`\`

### Start Development

\`\`\`bash
# Start both servers
npm run dev

# Or separately:
npm run dev:server  # http://localhost:3001
npm run dev:client  # http://localhost:3000
\`\`\`

---

## ��� Demo

See [DEMO.md](./DEMO.md) for complete 4-minute demo script

---

## ��� Implementation Status

| Feature | Status |
|---------|--------|
| CDP Wallet Auth | ✅ Functional |
| x402 Payments | ✅ Functional |
| AgentKit Auto-Purchase | ✅ Functional |
| Faucet System | ✅ Functional |
| AI Recommendations | ❌ Mock |
| Rankings | ❌ Mock |

---

## ��� Important Links

- **USDC Contract**: 0x036CbD53842c5426634e7929541eC2318f3dCF7e
- **Network**: Base Sepolia (Chain ID: 84532)
- **Explorer**: https://sepolia.basescan.org/

---

## ��� Roadmap

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

## ��� License

MIT License

---

**Built for creators. Powered by Coinbase. Zero commission. Forever.**
