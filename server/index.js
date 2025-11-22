import express from "express";
import cors from "cors";
import dotenv from "dotenv";

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
