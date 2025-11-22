import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { requestFaucet } from "./faucet.js";
import { getTokenBalances } from "./balances.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cors());

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    name: "Cryptoon API",
    description: "Backend para Cryptoon NFT Memes",
    version: "1.0.0",
    endpoints: {
      "GET /health": "Health check",
      "GET /api/memes": "Obtener lista de memes",
      "POST /api/memes": "Crear nuevo meme",
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

// Obtener lista de memes (temporal - datos mock)
app.get("/api/memes", (req, res) => {
  res.json({
    memes: [
      {
        id: 1,
        title: "Hodl Strong",
        imageUrl: "https://via.placeholder.com/400",
        creator: "0x1234...5678",
        price: "0.001",
        likes: 42
      },
      {
        id: 2,
        title: "To The Moon",
        imageUrl: "https://via.placeholder.com/400",
        creator: "0xabcd...efgh",
        price: "0.002",
        likes: 128
      }
    ]
  });
});

// Crear nuevo meme (temporal - solo respuesta)
app.post("/api/memes", (req, res) => {
  const { title, imageUrl, price } = req.body;
  
  if (!title || !imageUrl) {
    return res.status(400).json({ 
      error: "Se requiere título e imagen" 
    });
  }

  res.json({
    success: true,
    meme: {
      id: Date.now(),
      title,
      imageUrl,
      price: price || "0.001",
      creator: "0x...",
      likes: 0,
      timestamp: new Date().toISOString()
    }
  });
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

    console.log(`Requesting faucet for address: ${address}`);
    const txHash = await requestFaucet(address, apiKeyId, apiKeySecret);

    res.json({
      success: true,
      transactionHash: txHash,
      amount: "0.1",
      token: "USDC",
      network: "base-sepolia"
    });
  } catch (error) {
    console.error("Faucet error:", error);
    res.status(500).json({ 
      error: "Failed to request faucet",
      message: error.message 
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
    error: "Algo salió mal!",
    message: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎭 Cryptoon server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
