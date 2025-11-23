# Pre-Hackathon Checklist

Use this checklist 24 hours before your presentation.

---

## 📋 Documentation

- [x] **README.md** - Complete with architecture, features, setup instructions
- [x] **DEMO.md** - 4-minute demo script with step-by-step guide
- [x] **ARCHITECTURE.md** - Technical deep-dive for judges
- [x] **.env.example** files - Both client & server with clear instructions
- [x] **package.json** scripts - `npm run setup`, `npm run dev` working
- [ ] **LICENSE** file - Add MIT license
- [ ] **Video demo** - Record 3-4 minute walkthrough

---

## 🔧 Technical Setup

### Dependencies
- [x] Root `package.json` with concurrently
- [x] Server dependencies installed
- [x] Client dependencies installed
- [x] No npm audit vulnerabilities

### Configuration
- [x] `server/.env` configured with CDP credentials
- [x] `client/.env.local` configured (optional)
- [x] `.gitignore` includes `.env` and sensitive files
- [x] No sensitive data tracked in git

### Verification
Run: `./check-readiness.sh`
Expected output: ✅ ALL CHECKS PASSED!

---

## 🧪 Testing

### End-to-End Flow

1. **Authentication**
   - [ ] Login with email works
   - [ ] Login with passkey works
   - [ ] Wallet address shows in nav bar
   - [ ] Session persists on refresh

2. **Faucet**
   - [ ] "Get Free USDC" button works
   - [ ] Balance updates after 3 seconds
   - [ ] Transaction visible on Basescan
   - [ ] Wallet shows 1+ USDC

3. **Manual Payment (x402)**
   - [ ] Free chapters accessible without payment
   - [ ] Premium chapter shows HTTP 402
   - [ ] Payment modal displays correct price (0.01 USDC)
   - [ ] Payment processes in < 5 seconds
   - [ ] Chapter unlocks after payment
   - [ ] Transaction visible on Basescan
   - [ ] Purchase recorded in history

4. **AgentKit Auto-Purchase**
   - [ ] Navigate to `/settings`
   - [ ] Toggle "Enable Auto-Purchase" turns ON
   - [ ] Monthly limit slider works (default 1 USDC)
   - [ ] Mark series as favorite (⭐) works
   - [ ] Settings save successfully
   - [ ] Navigate to `/admin`
   - [ ] Agent wallet shows correct address
   - [ ] "Fund USDC" button works
   - [ ] "Fund ETH" button works
   - [ ] Balance updates in real-time (5s)
   - [ ] Basescan link opens correctly
   - [ ] Wait 60 seconds
   - [ ] Agent purchases new chapter automatically
   - [ ] Purchase appears in history with tx hash
   - [ ] Monthly spending counter updates
   - [ ] Purchase history shows correct details

5. **Reset & Re-test**
   - [ ] Click "Reset All Data" in `/admin`
   - [ ] Purchases cleared
   - [ ] Can re-purchase same chapter
   - [ ] Agent history cleared

### Error Scenarios

- [ ] **Insufficient balance** - Try to pay without USDC
  - Expected: Error message "Insufficient balance"
  
- [ ] **Agent wallet empty** - Enable auto-purchase without funding agent
  - Expected: "Insufficient balance to execute the transaction"
  
- [ ] **Monthly limit reached** - Set limit to 0.01, try to buy 2 chapters
  - Expected: "Monthly spending limit exceeded"

---

## 🎥 Video Demo

### Recording Setup

- [ ] Screen resolution: 1920x1080
- [ ] OBS/Loom configured
- [ ] Browser tabs cleaned up
- [ ] Audio test (clear voice, no background noise)
- [ ] Test recording (5 seconds)

### Content Checklist

Follow `DEMO.md` script:

- [ ] **Act 1: Onboarding** (0:30)
  - Show homepage
  - Login process
  - Wallet creation

- [ ] **Act 2: Faucet** (0:30)
  - Request testnet USDC
  - Balance update
  - Basescan verification

- [ ] **Act 3: Manual Payment** (1:00)
  - Browse series
  - Try premium chapter
  - HTTP 402 shown
  - Payment process
  - Chapter unlocks
  - Transaction link

- [ ] **Act 4: AgentKit** (1:00)
  - Settings configuration
  - Fund agent wallet
  - Mark favorites
  - Show auto-purchase
  - History verification

- [ ] **Act 5: Impact** (1:00)
  - Explain zero commission
  - Instant settlement
  - Global access
  - Closing statement

### Post-Recording

- [ ] Trim dead air
- [ ] Add text overlays for key points
- [ ] Add intro/outro (optional)
- [ ] Export in 1080p
- [ ] Upload to YouTube (unlisted)
- [ ] Test video plays properly
- [ ] Get feedback from teammate

---

## 📊 Presentation Prep

### Pitch Deck (Optional)

If creating slides:

1. **Problem** (1 slide)
   - Traditional platforms take 30-50% commission
   - Delayed payments (30-90 days)
   - Geographic restrictions

2. **Solution** (1 slide)
   - Zero commission marketplace
   - Instant USDC settlement
   - AgentKit autonomous payments

3. **Architecture** (1 slide)
   - Diagram showing CDP products
   - User → x402 → AgentKit → Blockchain

4. **Demo** (1 slide)
   - Screenshot or QR code to demo
   - "See it in action!"

5. **Impact** (1 slide)
   - Empowering 1M+ creators globally
   - 100% revenue to creators
   - Future roadmap

### Key Talking Points

Memorize these:

1. **Elevator Pitch** (30 seconds)
   > "Cryptoon is a zero-commission manga marketplace. Traditional platforms like Webtoon take 50% and pay creators months later. We use Coinbase's x402 protocol for instant micropayments and AgentKit for autonomous subscriptions. Creators keep 100%, paid in seconds, not months."

2. **CDP Products Used** (15 seconds)
   > "We integrate 5 CDP products: Embedded Wallet for auth, x402 for payments, AgentKit for autonomous purchases, Faucet API for testing, and Token Balances for real-time tracking."

3. **Why It Matters** (15 seconds)
   > "There are over 1 million webtoon creators globally. Most earn less than minimum wage due to platform fees. Cryptoon gives them 100% of revenue with instant settlement. That's life-changing."

4. **What's Functional** (15 seconds)
   > "Everything you see is fully functional on Base Sepolia. Real USDC transfers, real autonomous agent, real blockchain transactions. Not a mockup—it works today."

---

## 🚨 Day-Of Checklist

### 2 Hours Before

- [ ] Run `./check-readiness.sh` - ensure all green
- [ ] Start both servers: `npm run dev`
- [ ] Test login flow one more time
- [ ] Verify demo wallet has 1+ USDC
- [ ] Verify agent wallet has USDC + ETH
- [ ] Clear browser cache/cookies for fresh demo
- [ ] Charge laptop (100% battery)
- [ ] Have backup device ready

### 1 Hour Before

- [ ] Open browser with tabs:
  - Tab 1: http://localhost:3000 (homepage)
  - Tab 2: http://localhost:3000/admin (admin)
  - Tab 3: https://sepolia.basescan.org/ (verification)
- [ ] Test microphone
- [ ] Close unnecessary apps
- [ ] Enable "Do Not Disturb"
- [ ] Have script notes ready (DEMO.md printed)

### During Presentation

- [ ] Speak slowly and clearly
- [ ] Show enthusiasm!
- [ ] Point out key features:
  - Zero commission
  - Instant settlement
  - No seed phrases
  - Autonomous payments
- [ ] Show Basescan for transparency
- [ ] Mention future roadmap
- [ ] Thank judges for their time

### After Presentation

- [ ] Answer questions confidently
- [ ] If something breaks: "This is testnet, but here's a video of it working..."
- [ ] Mention you're open to feedback
- [ ] Share GitHub repo if asked

---

## 🎯 Scoring Optimization

### What Judges Look For

1. **Innovation** (30%)
   - Unique use of CDP products
   - Novel approach to creator payments
   - AgentKit + x402 combination

2. **Technical Implementation** (30%)
   - Clean code architecture
   - Proper error handling
   - Security best practices
   - Complete documentation

3. **User Experience** (20%)
   - Easy onboarding (no Web3 complexity)
   - Clear payment flow
   - Intuitive UI

4. **Impact** (20%)
   - Solves real problem for creators
   - Global reach with stablecoins
   - Scalability potential

### How to Score High

✅ **Do:**
- Show working demo (live or video)
- Explain technical decisions
- Mention all 5 CDP products used
- Highlight zero commission model
- Show Basescan transactions (transparency)
- Admit what's mockup vs functional
- Discuss future roadmap

❌ **Don't:**
- Pretend mockups are functional
- Oversell the product
- Get defensive about limitations
- Rush through the demo
- Forget to mention CDP products

---

## 🆘 Emergency Backup Plan

### If Demo Breaks

**Have ready:**
1. Pre-recorded video (upload to YouTube)
2. Screenshots of key screens
3. Basescan transaction links (from earlier tests)
4. Explanation: "This is testnet—here's proof it worked earlier"

### Common Issues & Fixes

**Login fails:**
> "Let me switch to a pre-authenticated account..."

**Payment hangs:**
> "Network congestion—but here's a video of it working..."

**Agent not purchasing:**
> "The agent runs every 60 seconds. Here's the purchase history from earlier..."

**Basescan slow:**
> "While that loads, let me show you the transaction hash..."

---

## ✅ Final Verification

Run these commands:

```bash
# 1. Check everything is ready
./check-readiness.sh

# 2. Start servers
npm run dev

# 3. Open in browser
open http://localhost:3000

# 4. Test full flow (10 minutes)
# - Login
# - Faucet
# - Manual payment
# - AgentKit setup
# - Admin monitoring

# 5. Record demo video
# - Follow DEMO.md script
# - 3-4 minutes max
# - Upload to YouTube unlisted

# 6. Practice pitch
# - 2-minute version
# - 5-minute version
# - Answer Q&A
```

---

## 📞 Support Contacts

If you need help:

- **CDP Documentation**: https://docs.cdp.coinbase.com/
- **Base Discord**: https://base.org/discord
- **x402 Docs**: https://x402.org/

---

## 🎉 You Got This!

**Remember:**
- Your project solves a real problem
- You're using cutting-edge tech
- You've built something functional
- The judges want you to succeed

**Confidence is key!**

Take a deep breath. You're ready. Go win that hackathon! 🚀

---

**Last check before submitting:**
- [ ] README.md complete ✅
- [ ] DEMO.md ready ✅
- [ ] Video recorded ✅
- [ ] GitHub repo clean ✅
- [ ] `.env` not in git ✅
- [ ] All tests passing ✅
- [ ] Pitch practiced ✅

**Status:** 🟢 HACKATHON READY

Good luck! 🍀
