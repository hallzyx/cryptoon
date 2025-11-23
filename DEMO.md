# 🎬 Cryptoon Demo Script

**Duration**: 4 minutes  
**Goal**: Show how creators earn 100% revenue with zero friction

---

## 🎯 Demo Objectives

1. Prove Web3 onboarding is as easy as Web2
2. Show instant micropayments in action
3. Demonstrate autonomous agent payments
4. Highlight creator benefits

---

## 📋 Pre-Demo Checklist

### Before Starting

- [ ] Both servers running (`npm run dev` from root)
- [ ] Browser cleared (fresh session, no cached wallet)
- [ ] `/admin` open in second tab (for live monitoring)
- [ ] Basescan tab ready (https://sepolia.basescan.org/)
- [ ] Stop any auto-purchase agents (if testing)
- [ ] Screen recording software ready

### Environment Check

```bash
# Terminal 1: Backend running on http://localhost:3001
cd server && npm run dev

# Terminal 2: Frontend running on http://localhost:3000
cd client && npm run dev

# Verify agent wallet initialized (check server logs):
# ✅ Agent wallet ready: 0x...
# 💰 Agent balance: X.XX USDC
```

### Demo Data Reset (Optional)

```bash
# Visit http://localhost:3000/admin
# Click "Reset All Data" to clear purchase history
```

---

## 🎥 Act 1: Web3 Onboarding (30 seconds)

**Narrative**: *"Web3 doesn't have to be scary. Watch how easy it is."*

### Steps

1. **Open Homepage** (http://localhost:3000)
   ```
   "This is Cryptoon - a zero-commission marketplace for manga creators."
   ```

2. **Click "Login with CDP"**
   ```
   "No MetaMask extension needed. No seed phrases to write down."
   ```

3. **Choose Auth Method**
   - **Option A**: Email → Enter email → Verify code
   - **Option B**: Passkey → FaceID/TouchID/PIN
   - **Option C**: Social login
   
   ```
   "Just like logging into Netflix or Spotify."
   ```

4. **Wallet Created! ✅**
   ```
   "And just like that - you have a Web3 wallet.
    Your address is shown in the nav bar."
   ```

**Timing**: 0:00 - 0:30

---

## 🎥 Act 2: Get Testnet Funds (30 seconds)

**Narrative**: *"Let's get some USDC to test with."*

### Steps

1. **Show Balance**
   ```
   "Right now, we have 0 USDC. Let's fix that."
   ```

2. **Click "Get Free USDC" Button**
   ```
   "In production, users would buy USDC on Coinbase.
    For testing, CDP gives us free testnet USDC."
   ```

3. **Wait for Confirmation** (3 seconds)
   ```
   "Transaction processing on Base Sepolia..."
   ```

4. **Balance Updates! 💰**
   ```
   "1 USDC received instantly. No 3-5 business days.
    No bank wire. Just seconds."
   ```

5. **Verify on Basescan** (Optional)
   ```
   Click balance → Opens Basescan
   "Here's the actual blockchain transaction. 
    Fully transparent. Fully verifiable."
   ```

**Timing**: 0:30 - 1:00

---

## 🎥 Act 3: Pay for Premium Chapter (1 minute)

**Narrative**: *"Now let's see the magic of x402 micropayments."*

### Steps

1. **Browse Series**
   ```
   "Let's check out 'Chronos Paradox' - a time travel thriller."
   ```

2. **Click Series Card** → Series Page
   ```
   "First 4 chapters are free. Chapter 5 is premium."
   ```

3. **Try to Open Chapter 5**
   ```
   "When I click Chapter 5..."
   ```

4. **See HTTP 402 "Payment Required"** ⚠️
   ```
   "The server responds with HTTP 402 - Payment Required.
    This is the x402 protocol in action."
   ```

5. **Payment Modal Shows**
   ```
   "0.01 USDC to unlock. That's 1 cent.
    No subscription. No recurring charges. 
    Pay only for what you read."
   ```

6. **Click "Pay 0.01 USDC"**
   ```
   "Transaction submits automatically. 
    No manual signature popup.
    No gas estimation confusion."
   ```

7. **Payment Processing** (2-3 seconds)
   ```
   "Verifying on Base blockchain..."
   ```

8. **Chapter Unlocked! 🎉**
   ```
   "And it's unlocked! I can now read the chapter.
    Payment verified. Content delivered. All in 3 seconds."
   ```

9. **Show Transaction Link** (Optional)
   ```
   Click "View Transaction"
   "Here's the on-chain proof. 
    0.01 USDC sent directly to the creator's wallet.
    Zero middlemen. Zero commission."
   ```

**Timing**: 1:00 - 2:00

---

## 🎥 Act 4: Autonomous Agent Setup (1 minute)

**Narrative**: *"But what if I don't want to manually pay for every chapter?"*

### Steps

1. **Navigate to Settings** (`/settings`)
   ```
   "This is where AgentKit comes in.
    An AI agent that auto-purchases new chapters for you."
   ```

2. **Toggle "Enable Auto-Purchase" ON**
   ```
   "I'm telling the agent: 'Hey, when my favorite series 
    releases a new chapter, just buy it for me.'"
   ```

3. **Set Monthly Limit** (e.g., 1 USDC)
   ```
   "I set a monthly spending limit - like a budget.
    The agent won't exceed this."
   ```

4. **Mark Series as Favorites ⭐**
   ```
   "I mark 'Chronos Paradox' and 'Mecha Heart' as favorites."
   ```

5. **Switch to Admin Tab** (`/admin`)
   ```
   "This is the admin dashboard showing the agent's wallet.
    Right now it has 0 USDC. The agent can't buy anything."
   ```

6. **Fund Agent Wallet**
   - Click "💰 Fund USDC (for purchases)"
   - Click "⛽ Fund ETH (for gas fees)"
   
   ```
   "The agent needs USDC to pay for chapters, 
    and a bit of ETH for gas fees.
    Let's fund it..."
   ```

7. **Watch Balance Update** (Live refresh every 5s)
   ```
   "Agent now has 1 USDC and some ETH.
    It's ready to work."
   ```

8. **Show Agent in Action** (Optional)
   ```
   "Every 60 seconds, the agent checks my favorites.
    If there's a new premium chapter - it buys it automatically.
    No manual approval needed."
   ```

9. **Show Purchase History**
   ```
   "Here's the history. You can see the agent 
    auto-purchased Chapter 6 just now.
    With a transaction link for verification."
   ```

**Timing**: 2:00 - 3:00

---

## 🎥 Act 5: Creator Impact (1 minute)

**Narrative**: *"Why does this matter?"*

### Key Points to Emphasize

1. **Zero Commission**
   ```
   "Traditional platforms take 30-50% commission.
    Webtoon takes 50%. Patreon takes 8-12%.
    
    Cryptoon takes ZERO.
    100% goes directly to the creator's wallet."
   ```

2. **Instant Settlement**
   ```
   "Traditional platforms pay creators 30-90 days later.
    
    On Cryptoon, creators receive payment in 3 seconds.
    Real-time settlement. No waiting."
   ```

3. **Global Access**
   ```
   "USDC is a stablecoin. No currency conversion fees.
    A fan in Brazil can pay a creator in Japan.
    A fan in Nigeria can support a creator in Korea.
    
    No PayPal restrictions. No regional locks."
   ```

4. **Transparent & Verifiable**
   ```
   "Every transaction is on-chain.
    Creators can see exactly who paid, when, and how much.
    No platform hiding data. No opaque accounting."
   ```

5. **Autonomous Payments**
   ```
   "AgentKit means fans never miss a chapter.
    Creators get consistent revenue.
    The agent handles the boring stuff - fans just read."
   ```

### Closing Line

```
"Cryptoon is built for creators.
 Powered by Coinbase Developer Platform.
 Zero commission. Forever."
```

**Timing**: 3:00 - 4:00

---

## 📹 Recording Tips

### Camera Setup

- **Screen Recording**: Use OBS, Loom, or native tools
- **Resolution**: 1920x1080 minimum
- **Frame Rate**: 30fps or 60fps
- **Audio**: Clear voiceover, minimize background noise

### Screen Layout

```
┌─────────────────────────────────────┐
│      Main Browser (Full Screen)     │  ← Primary focus
├─────────────────┬───────────────────┤
│  Server Logs    │   Basescan Tab    │  ← Show occasionally
│  (Terminal)     │   (Verification)  │
└─────────────────┴───────────────────┘
```

### During Recording

✅ **Do:**
- Speak clearly and confidently
- Move mouse slowly (viewers need to follow)
- Pause 1-2 seconds after each action
- Highlight key info (circle with mouse)
- Show enthusiasm!

❌ **Don't:**
- Rush through steps
- Assume viewers know Web3 jargon
- Skip error states (if they happen)
- Have messy browser tabs

### Editing

- Add **text overlays** for key points
- Use **zoom-in** for important actions
- Add **background music** (low volume)
- Include **"What We Built" slide** at end

---

## 🎬 B-Roll Ideas (Optional)

If you have extra time, record these clips:

1. **Agent working in background** (time-lapse of 60s check)
2. **Balance increasing** (multiple transactions)
3. **Basescan transaction list** (proof of activity)
4. **Mobile mockup** (if responsive)
5. **Code snippets** (showing x402 + AgentKit integration)

---

## 🚨 Troubleshooting During Demo

### If Login Fails
```
"Sometimes wallet creation needs a refresh. Let me try again..."
[Refresh page, retry]
```

### If Faucet Fails
```
"Looks like we hit the rate limit. But I have another wallet 
 already funded that I can switch to..."
[Switch account or use pre-funded demo wallet]
```

### If Payment Hangs
```
"Network congestion - this is testnet after all. 
 In production on Base mainnet, this is instant..."
[Wait 5 more seconds or refresh]
```

### If Agent Not Purchasing
```
"The agent runs every 60 seconds. Since we just set it up,
 let's fast-forward and show the purchase history from 
 earlier tests..."
[Show pre-recorded agent activity or /admin history]
```

---

## ✅ Post-Demo Checklist

- [ ] Video saved and backed up
- [ ] Trim any dead air or errors
- [ ] Add intro/outro slides
- [ ] Upload to YouTube/Loom (unlisted)
- [ ] Test video plays on different devices
- [ ] Share link with teammates for feedback

---

## 🎯 Key Metrics to Mention

- **Transaction Time**: ~3 seconds
- **Creator Revenue**: 100% (zero commission)
- **Payment Amount**: $0.01 USDC (micropayments work!)
- **Network**: Base Sepolia (low fees, fast)
- **Agent Check Interval**: 60 seconds
- **Setup Time**: <2 minutes (no coding required)

---

## 💡 Elevator Pitch (30 seconds)

*Use this if you only have 30 seconds to explain the project:*

> "Cryptoon is Netflix for manga, but creators keep 100% of revenue.
> 
> Traditional platforms take 30-50% commission and pay creators months later.
> 
> We use Coinbase's x402 protocol for instant micropayments, 
> and AgentKit to auto-purchase new chapters - like a Netflix subscription, 
> but on-chain.
> 
> Fans in Brazil can support creators in Korea with USDC stablecoins.
> Zero middlemen. Zero commission. Just creators and fans."

---

## 📊 Comparison Slide (Optional)

| Feature | Traditional Platforms | Cryptoon |
|---------|----------------------|----------|
| **Commission** | 30-50% | 0% |
| **Settlement Time** | 30-90 days | 3 seconds |
| **Payment Method** | Credit card, PayPal | USDC (crypto) |
| **Geographic Limits** | Yes (many regions excluded) | None |
| **Transparency** | Opaque accounting | On-chain verification |
| **Auto-payments** | Subscription only | AgentKit autonomous |
| **Creator Control** | Platform sets rules | Creator sets prices |

---

**Good luck with your demo! You got this! 🚀**
