import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { paymentMiddleware } from "x402-express";
import { facilitator } from "@coinbase/x402";
import { requestFaucet } from "./faucet.js";
import { getTokenBalances } from "./balances.js";
import { getChapterContent, isChapterFree, recordPurchase, hasUserPurchased, getAllPurchases } from "./chapters.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const RECEIVER_WALLET = process.env.RECEIVER_WALLET || "0x6f21c2155bf93b49348a422a604310f8ccd6ec74";

console.log('🔑 CDP API Key configured:', process.env.CDP_API_KEY_ID ? '✅' : '❌');
console.log('🔑 CDP API Secret configured:', process.env.CDP_API_KEY_SECRET ? '✅' : '❌');
console.log('💰 Receiver wallet:', RECEIVER_WALLET);

// Middleware
app.use(express.json());
app.use(cors());

// Free chapters endpoint (before x402 middleware)
app.get("/api/chapter-free/:seriesId/:chapterId", async (req, res) => {
  try {
    const { seriesId, chapterId } = req.params;
    const { address } = req.query;
    
    console.log(`\n📖 Free chapter request: Series ${seriesId}, Chapter ${chapterId}`);
    if (address) console.log(`   👤 User: ${address}`);

    const chapterContent = getChapterContent(seriesId, chapterId);
    if (!chapterContent) {
      return res.status(404).json({ error: "Chapter not found" });
    }

    const isFree = isChapterFree(seriesId, chapterId);
    
    // Check if user already purchased this premium chapter
    const alreadyPurchased = address && hasUserPurchased(address, seriesId, chapterId);
    
    if (!isFree && !alreadyPurchased) {
      return res.status(403).json({ error: "This chapter requires payment" });
    }

    if (alreadyPurchased) {
      console.log(`   ✅ Already purchased - delivering content`);
    } else {
      console.log(`   ✅ Free chapter delivered`);
    }
    
    res.json({
      success: true,
      chapter: chapterContent,
      free: isFree,
      purchased: alreadyPurchased
    });

  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ 
      error: "Failed to fetch chapter",
      message: error.message 
    });
  }
});

// Apply x402 payment middleware ONLY for premium chapters and AI recommendations
app.use(paymentMiddleware(
  RECEIVER_WALLET,
  {
    "GET /api/chapters/*": {
      price: "$0.01",  // 0.01 USDC
      network: "base-sepolia",
      config: {
        description: "Unlock premium manga/webtoon chapter",
        outputSchema: {
          type: "object",
          properties: {
            chapter: { type: "object", description: "Chapter content" },
            purchased: { type: "boolean" }
          }
        }
      }
    },
    "POST /api/recommendations/request": {
      price: "$0.01",  // 0.01 USDC per AI recommendation
      network: "base-sepolia",
      config: {
        description: "Get AI-powered manga/webtoon recommendation",
        outputSchema: {
          type: "object",
          properties: {
            recommendation: { type: "string", description: "AI generated recommendation" },
            success: { type: "boolean" }
          }
        }
      }
    }
  },
  facilitator // CDP hosted facilitator (auto-reads CDP_API_KEY_ID and CDP_API_KEY_SECRET)
));

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    name: "Cryptoon API",
    description: "Backend para Cryptoon - x402 Payment System",
    version: "2.0.0",
    endpoints: {
      "GET /health": "Health check",
      "POST /api/faucet": "Request testnet USDC",
      "GET /api/balance/:address": "Get wallet balance",
      "GET /api/chapter-free/:seriesId/:chapterId": "Get free or purchased chapter",
      "GET /api/chapters/:seriesId/:chapterId": "Unlock premium chapter (x402)",
      "POST /api/recommendations/request": "Get AI recommendation (x402)",
      "GET /api/purchases/:address": "Get user purchases"
    },
    payment: {
      price: "0.01 USDC",
      network: "base-sepolia",
      //receiver: RECEIVER_WALLET
    }
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    message: "Cryptoon server is running",
    timestamp: new Date().toISOString()
  });
});

// Chapter endpoint - x402 enabled (middleware handles payment for premium chapters)
app.get("/api/chapters/:seriesId/:chapterId", async (req, res) => {
  try {
    const { seriesId, chapterId } = req.params;
    const { address } = req.query;

    console.log(`\n💎 Premium chapter request: Series ${seriesId}, Chapter ${chapterId}`);
    if (address) console.log(`   👤 User: ${address}`);

    // Get chapter content
    const chapterContent = getChapterContent(seriesId, chapterId);
    if (!chapterContent) {
      return res.status(404).json({ error: "Chapter not found" });
    }

    // This endpoint is ONLY for premium chapters
    const isFree = isChapterFree(seriesId, chapterId);
    if (isFree) {
      return res.status(400).json({ 
        error: "This is a free chapter. Use /api/chapter-free/:seriesId/:chapterId instead" 
      });
    }

    // Check if user already purchased this chapter
    if (address && hasUserPurchased(address, seriesId, chapterId)) {
      console.log(`   ✅ Already purchased - delivering content`);
      return res.json({
        success: true,
        chapter: chapterContent,
        purchased: true,
        alreadyOwned: true,
        timestamp: new Date().toISOString()
      });
    }

    // If we reach here, x402 middleware has verified payment
    console.log(`   ✅ Payment verified by x402 middleware`);
    
    if (address) {
      recordPurchase(address, seriesId, chapterId, "x402-payment", "0.01 USDC");
    }

    res.json({
      success: true,
      chapter: chapterContent,
      purchased: true,
      paid: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ 
      error: "Failed to fetch chapter",
      message: error.message 
    });
  }
});

// AI Recommendations endpoint - x402 enabled
app.post("/api/recommendations/request", async (req, res) => {
  try {
    const { userId, prompt } = req.body;
    
    console.log(`\n🤖 AI Recommendation request from: ${userId}`);
    console.log(`   📝 Prompt: ${prompt}`);

    if (!userId || !prompt) {
      return res.status(400).json({ error: "userId and prompt are required" });
    }

    // If we reach here, x402 middleware has verified payment
    console.log(`   ✅ Payment verified by x402 middleware`);
    
    // Send request to n8n webhook
    try {
      console.log(`   🔗 Sending to n8n webhook...`);
      const webhookResponse = await fetch('https://n8n.arroz.dev/webhook/cryptoon-recommendation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          prompt,
          paid: true,
          amount: "0.01 USDC",
          timestamp: new Date().toISOString()
        })
      });

      if (!webhookResponse.ok) {
        throw new Error(`Webhook responded with status ${webhookResponse.status}`);
      }

      const webhookData = await webhookResponse.json();
      console.log(`   ✅ n8n response received:`, JSON.stringify(webhookData, null, 2));

      // Extract recommendation from n8n response
      // n8n returns an array like: [{ "output": "recommendation text" }]
      let recommendation = "Recommendation generated successfully!";
      
      if (Array.isArray(webhookData) && webhookData.length > 0 && webhookData[0].output) {
        recommendation = webhookData[0].output;
      } else if (webhookData.output) {
        recommendation = webhookData.output;
      } else if (webhookData.recommendation) {
        recommendation = webhookData.recommendation;
      } else if (webhookData.message) {
        recommendation = webhookData.message;
      }

      res.json({
        success: true,
        recommendation,
        paid: true,
        amount: "0.01 USDC",
        timestamp: new Date().toISOString()
      });

    } catch (webhookError) {
      console.error(`   ❌ Webhook error:`, webhookError);
      
      // Fallback to mock recommendation if webhook fails
      const mockRecommendation = `Based on your interest in "${prompt}", here are some recommendations:\n\n1. **Shadow Realm Chronicles** - A dark fantasy manga where a young warrior discovers ancient powers. Perfect for fans of supernatural action!\n\n2. **Neon Samurai** - Cyberpunk meets traditional samurai culture in this unique webtoon. Great character development and stunning art.\n\n3. **The Last Mage** - Epic fantasy series with complex magic systems and political intrigue. Highly rated by our community!\n\nEach series has free chapters to start. Enjoy your reading! ✨`;

      res.json({
        success: true,
        recommendation: mockRecommendation,
        paid: true,
        amount: "0.01 USDC",
        timestamp: new Date().toISOString(),
        note: "Using fallback recommendation (webhook unavailable)"
      });
    }

  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ 
      error: "Failed to generate recommendation",
      message: error.message 
    });
  }
});

// Get user's purchased chapters
app.get("/api/purchases/:address", async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!address) {
      return res.status(400).json({ error: "Address is required" });
    }

    const purchases = getAllPurchases();
    const userPurchases = purchases.filter(
      p => p.address.toLowerCase() === address.toLowerCase()
    );

    console.log(`📋 Purchases for ${address}: ${userPurchases.length} chapters`);

    res.json({
      success: true,
      purchases: userPurchases,
      count: userPurchases.length
    });

  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ 
      error: "Failed to fetch purchases",
      message: error.message 
    });
  }
});

// Faucet endpoint - Request testnet USDC
app.post("/api/faucet", async (req, res) => {
  try {
    const { address } = req.body;
    
    if (!address) {
      return res.status(400).json({ error: "Address is required" });
    }

    const apiKeyId = process.env.CDP_API_KEY_ID;
    const apiKeySecret = process.env.CDP_API_KEY_SECRET;

    if (!apiKeyId || !apiKeySecret) {
      return res.status(500).json({ error: "CDP API credentials not configured" });
    }

    console.log(`💧 Requesting faucet for: ${address}`);
    const txHash = await requestFaucet(address, apiKeyId, apiKeySecret);

    res.json({
      success: true,
      transactionHash: txHash,
      amount: "0.1",
      token: "USDC",
      network: "base-sepolia",
      message: "USDC will arrive shortly"
    });
  } catch (error) {
    console.error("Faucet error:", error);
    res.status(500).json({ 
      error: "Failed to request faucet",
      message: error.message,
      details: "May be hitting rate limits; try again in a few minutes"
    });
  }
});

// Balance endpoint - Get token balances
app.get("/api/balance/:address", async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!address) {
      return res.status(400).json({ error: "Address is required" });
    }

    const apiKeyId = process.env.CDP_API_KEY_ID;
    const apiKeySecret = process.env.CDP_API_KEY_SECRET;

    if (!apiKeyId || !apiKeySecret) {
      return res.status(500).json({ error: "CDP API credentials not configured" });
    }

    const balance = await getTokenBalances(address, "base-sepolia", apiKeyId, apiKeySecret);

    res.json({
      success: true,
      address,
      balance,
      token: "USDC",
      network: "base-sepolia"
    });
  } catch (error) {
    console.error("Balance error:", error);
    res.status(500).json({ 
      error: "Failed to fetch balance",
      message: error.message 
    });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: "Something went wrong!",
    message: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🎭 Cryptoon Server v2.0 - x402 Payment System`);
  console.log(`📍 Running on http://localhost:${PORT}`);
  console.log(`\n💳 Payment Configuration:`);
  console.log(`   Price: 0.01 USDC per chapter`);
  console.log(`   Receiver: ${RECEIVER_WALLET}`);
  console.log(`   Network: Base Sepolia`);
  console.log(`\nEndpoints:`);
  console.log(`   GET  /api/chapters/:seriesId/:chapterId - Get chapter (x402)`);
  console.log(`   GET  /api/balance/:address - Get balance`);
  console.log(`   POST /api/faucet - Request testnet USDC`);
  console.log(`\n✅ Server ready!\n`);
});
