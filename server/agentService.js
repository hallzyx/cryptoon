import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getUserFavorites } from "./favorites.js";
import { hasUserPurchased, recordPurchase } from "./chapters.js";
import { getEnabledUsers, getUserSettings, getMonthlySpending, recordAgentPurchase } from "./agentSettings.js";
import { getTokenBalances } from "./balances.js";
import { initializeAgentWallet, getAgentWalletAddress, getAgentBalance, transferUSDC, hasSufficientBalance } from "./agentWallet.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let isRunning = false;

/**
 * Load series data from db.json
 */
function loadSeriesData() {
  try {
    const dbPath = path.join(__dirname, "../client/public/db.json");
    const dbContent = fs.readFileSync(dbPath, "utf-8");
    const db = JSON.parse(dbContent);
    return db.series || [];
  } catch (error) {
    console.error("Error loading series data:", error);
    return [];
  }
}

/**
 * Check if user can afford purchase based on balance and monthly limit
 */
async function canAffordPurchase(address, chapterPrice, monthlyLimit, apiKeyId, apiKeySecret) {
  try {
    // Check user's balance first (for display/logging purposes)
    const userBalance = await getTokenBalances(address, "base-sepolia", apiKeyId, apiKeySecret);
    const userBalanceNum = parseFloat(userBalance);
    
    console.log(`      💰 User balance: ${userBalance} USDC`);
    
    // Check agent's balance (this is what actually matters for auto-purchase)
    const agentHasBalance = await hasSufficientBalance(chapterPrice.toString());
    
    if (!agentHasBalance) {
      const agentBalance = await getAgentBalance();
      console.log(`      💰 Agent balance: ${agentBalance} USDC`);
      return { canAfford: false, reason: "Agent wallet has insufficient USDC balance" };
    }
    
    // Check monthly spending
    const monthlySpent = getMonthlySpending(address);
    
    if (monthlySpent + chapterPrice > monthlyLimit) {
      return { canAfford: false, reason: "Monthly limit exceeded" };
    }
    
    return { canAfford: true };
  } catch (error) {
    console.error(`Error checking affordability for ${address}:`, error);
    return { canAfford: false, reason: error.message };
  }
}

/**
 * Main agent logic - check favorites and auto-purchase new chapters
 */
async function runAgentCheck() {
  if (isRunning) {
    console.log("🤖 Agent already running, skipping this cycle");
    return;
  }
  
  isRunning = true;
  
  try {
    console.log("\n🤖 Agent starting check cycle...");
    
    const apiKeyId = process.env.CDP_API_KEY_ID;
    const apiKeySecret = process.env.CDP_API_KEY_SECRET;
    
    if (!apiKeyId || !apiKeySecret) {
      console.log("❌ CDP credentials not configured, skipping agent cycle");
      return;
    }
    
    // Get all users with agent enabled
    const enabledUsers = getEnabledUsers();
    
    if (enabledUsers.length === 0) {
      console.log("ℹ️ No users have auto-purchase enabled");
      return;
    }
    
    console.log(`👥 Checking ${enabledUsers.length} user(s) with auto-purchase enabled`);
    
    // Load series data once
    const allSeries = loadSeriesData();
    
    for (const userSettings of enabledUsers) {
      const { address, monthlyLimit } = userSettings;
      
      console.log(`\n📋 Checking user: ${address}`);
      
      // Get user's favorites
      const favorites = getUserFavorites(address);
      
      if (favorites.length === 0) {
        console.log(`   ℹ️ No favorites for user ${address}`);
        continue;
      }
      
      console.log(`   ⭐ Found ${favorites.length} favorite series`);
      
      // Check each favorite series for unpurchased chapters
      for (const favorite of favorites) {
        const series = allSeries.find(s => s.id === parseInt(favorite.seriesId));
        
        if (!series) {
          console.log(`   ⚠️ Series ${favorite.seriesId} not found in database`);
          continue;
        }
        
        console.log(`   📚 Checking "${series.title}"...`);
        
        // Find chapters that are not free and not yet purchased
        const unpurchasedChapters = series.chapters.filter(chapter => 
          !chapter.free && !hasUserPurchased(address, favorite.seriesId, chapter.id.toString())
        );
        
        if (unpurchasedChapters.length === 0) {
          console.log(`      ✅ All premium chapters already owned`);
          continue;
        }
        
        console.log(`      💎 Found ${unpurchasedChapters.length} unpurchased chapter(s)`);
        
        // Try to purchase each unpurchased chapter
        for (const chapter of unpurchasedChapters) {
          const chapterPrice = parseFloat(chapter.price || 0.01);
          
          console.log(`      🛒 Attempting to purchase Chapter ${chapter.id}: "${chapter.title}" ($${chapterPrice} USDC)`);
          
          // Check if user can afford it
          const affordabilityCheck = await canAffordPurchase(
            address, 
            chapterPrice, 
            monthlyLimit,
            apiKeyId,
            apiKeySecret
          );
          
          if (!affordabilityCheck.canAfford) {
            console.log(`      ❌ Cannot purchase: ${affordabilityCheck.reason}`);
            recordAgentPurchase(
              address,
              favorite.seriesId,
              chapter.id.toString(),
              chapterPrice.toFixed(2),
              false,
              affordabilityCheck.reason
            );
            continue;
          }
          
          // Execute REAL USDC transfer via CDP SDK v2
          try {
            const RECEIVER_WALLET = process.env.RECEIVER_WALLET || "0x6f21c2155bf93b49348a422a604310f8ccd6ec74";
            
            console.log(`      🔄 Executing USDC transfer via CDP SDK v2...`);
            console.log(`      💸 Agent transferring ${chapterPrice.toFixed(2)} USDC to ${RECEIVER_WALLET}`);
            
            // Execute the actual blockchain transfer
            const txHash = await transferUSDC(RECEIVER_WALLET, chapterPrice.toFixed(2));
            
            console.log(`      ✅ Transfer successful!`);
            console.log(`      🔗 TX: ${txHash}`);
            console.log(`      📊 Basescan: https://sepolia.basescan.org/tx/${txHash}`);
            
            // Record the purchase with transaction hash
            recordPurchase(
              address,
              favorite.seriesId,
              chapter.id.toString(),
              txHash,
              chapterPrice.toFixed(2)
            );
            
            recordAgentPurchase(
              address,
              favorite.seriesId,
              chapter.id.toString(),
              chapterPrice.toFixed(2),
              true,
              null
            );
            
            console.log(`      ✅ Chapter ${chapter.id} purchased successfully!`);
            
          } catch (error) {
            console.log(`      ❌ Purchase failed: ${error.message}`);
            recordAgentPurchase(
              address,
              favorite.seriesId,
              chapter.id.toString(),
              chapterPrice.toFixed(2),
              false,
              error.message
            );
          }
        }
      }
    }
    
    console.log("\n🤖 Agent check cycle completed\n");
    
  } catch (error) {
    console.error("❌ Agent error:", error);
  } finally {
    isRunning = false;
  }
}

/**
 * Start the agent service with interval checking
 */
export function startAgentService() {
  console.log("\n🤖 Auto-Purchase Agent Service started");
  console.log("⏰ Checking every 60 seconds for new chapters...\n");
  
  // Run immediately on start
  runAgentCheck();
  
  // Then run every 60 seconds
  setInterval(runAgentCheck, 60000);
}
