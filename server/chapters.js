import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to purchases database
const PURCHASES_DB_PATH = path.join(__dirname, "purchases.json");

// Initialize purchases database
function initPurchasesDb() {
  if (!fs.existsSync(PURCHASES_DB_PATH)) {
    fs.writeFileSync(PURCHASES_DB_PATH, JSON.stringify({ purchases: [] }, null, 2));
    console.log("📁 Purchases database initialized");
  }
}

// Load purchases from file
function loadPurchases() {
  try {
    initPurchasesDb();
    const data = fs.readFileSync(PURCHASES_DB_PATH, "utf-8");
    return JSON.parse(data).purchases || [];
  } catch (error) {
    console.error("Error loading purchases:", error);
    return [];
  }
}

// Save purchases to file
function savePurchases(purchases) {
  try {
    fs.writeFileSync(PURCHASES_DB_PATH, JSON.stringify({ purchases }, null, 2));
  } catch (error) {
    console.error("Error saving purchases:", error);
  }
}

/**
 * Check if a user has purchased a specific chapter
 * @param {string} address - User's wallet address
 * @param {string} seriesId - Series ID
 * @param {string} chapterId - Chapter ID
 * @returns {boolean}
 */
export function hasUserPurchased(address, seriesId, chapterId) {
  const purchases = loadPurchases();
  return purchases.some(
    p => p.address.toLowerCase() === address.toLowerCase() &&
         p.seriesId === seriesId &&
         p.chapterId === chapterId
  );
}

/**
 * Record a chapter purchase
 * @param {string} address - User's wallet address
 * @param {string} seriesId - Series ID
 * @param {string} chapterId - Chapter ID
 * @param {string} txHash - Transaction hash (optional)
 * @param {string} amount - Amount paid
 */
export function recordPurchase(address, seriesId, chapterId, txHash = null, amount = "0.01") {
  const purchases = loadPurchases();
  
  // Check if already purchased
  const alreadyPurchased = purchases.some(
    p => p.address.toLowerCase() === address.toLowerCase() &&
         p.seriesId === seriesId &&
         p.chapterId === chapterId
  );
  
  if (!alreadyPurchased) {
    purchases.push({
      address: address.toLowerCase(),
      seriesId,
      chapterId,
      txHash,
      amount,
      timestamp: new Date().toISOString()
    });
    savePurchases(purchases);
    console.log(`✅ Purchase recorded: ${address} -> Series ${seriesId}, Chapter ${chapterId}`);
  } else {
    console.log(`ℹ️ Purchase already recorded: ${address} -> Series ${seriesId}, Chapter ${chapterId}`);
  }
}

/**
 * Get chapter content from db.json
 * @param {string} seriesId - Series ID
 * @param {string} chapterId - Chapter ID
 * @returns {Object|null} Chapter content or null if not found
 */
export function getChapterContent(seriesId, chapterId) {
  try {
    const dbPath = path.join(__dirname, "../client/public/db.json");
    const dbContent = fs.readFileSync(dbPath, "utf-8");
    const db = JSON.parse(dbContent);

    const chapterContent = db.chapterContent?.[seriesId]?.[chapterId];
    
    if (!chapterContent) {
      console.log(`❌ Chapter not found: Series ${seriesId}, Chapter ${chapterId}`);
      return null;
    }

    return chapterContent;
  } catch (error) {
    console.error("Error reading chapter content:", error);
    return null;
  }
}

/**
 * Check if a chapter is free
 * @param {string} seriesId - Series ID
 * @param {string} chapterId - Chapter ID
 * @returns {boolean}
 */
export function isChapterFree(seriesId, chapterId) {
  try {
    const dbPath = path.join(__dirname, "../client/public/db.json");
    const dbContent = fs.readFileSync(dbPath, "utf-8");
    const db = JSON.parse(dbContent);

    const series = db.series.find(s => s.id === parseInt(seriesId));
    if (!series) return false;

    const chapter = series.chapters.find(c => c.id === parseInt(chapterId));
    if (!chapter) return false;

    return chapter.free === true;
  } catch (error) {
    console.error("Error checking if chapter is free:", error);
    return false;
  }
}

/**
 * Get all purchases (for debugging)
 * @returns {Array}
 */
export function getAllPurchases() {
  return loadPurchases();
}

/**
 * Reset all purchases for a specific user (for testing)
 * @param {string} address - User's wallet address
 * @returns {number} Number of purchases deleted
 */
export function resetUserPurchases(address) {
  const purchases = loadPurchases();
  const initialCount = purchases.length;
  
  const filteredPurchases = purchases.filter(
    p => p.address.toLowerCase() !== address.toLowerCase()
  );
  
  savePurchases(filteredPurchases);
  const deletedCount = initialCount - filteredPurchases.length;
  
  console.log(`🔄 Reset purchases for ${address}: ${deletedCount} purchase(s) deleted`);
  return deletedCount;
}
