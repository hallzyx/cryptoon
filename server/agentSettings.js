import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SETTINGS_DB_PATH = path.join(__dirname, "agentSettings.json");
const HISTORY_DB_PATH = path.join(__dirname, "agentHistory.json");

// Initialize settings database
function initSettingsDb() {
  if (!fs.existsSync(SETTINGS_DB_PATH)) {
    fs.writeFileSync(SETTINGS_DB_PATH, JSON.stringify({ settings: [] }, null, 2));
    console.log("📁 Agent settings database initialized");
  }
}

// Initialize history database
function initHistoryDb() {
  if (!fs.existsSync(HISTORY_DB_PATH)) {
    fs.writeFileSync(HISTORY_DB_PATH, JSON.stringify({ history: [] }, null, 2));
    console.log("📁 Agent history database initialized");
  }
}

// Load settings from file
function loadSettings() {
  try {
    initSettingsDb();
    const data = fs.readFileSync(SETTINGS_DB_PATH, "utf-8");
    return JSON.parse(data).settings || [];
  } catch (error) {
    console.error("Error loading agent settings:", error);
    return [];
  }
}

// Save settings to file
function saveSettings(settings) {
  try {
    fs.writeFileSync(SETTINGS_DB_PATH, JSON.stringify({ settings }, null, 2));
  } catch (error) {
    console.error("Error saving agent settings:", error);
  }
}

// Load history from file
function loadHistory() {
  try {
    initHistoryDb();
    const data = fs.readFileSync(HISTORY_DB_PATH, "utf-8");
    return JSON.parse(data).history || [];
  } catch (error) {
    console.error("Error loading agent history:", error);
    return [];
  }
}

// Save history to file
function saveHistory(history) {
  try {
    fs.writeFileSync(HISTORY_DB_PATH, JSON.stringify({ history }, null, 2));
  } catch (error) {
    console.error("Error saving agent history:", error);
  }
}

/**
 * Get user's agent settings
 * @param {string} address - User's wallet address
 * @returns {Object|null}
 */
export function getUserSettings(address) {
  const settings = loadSettings();
  return settings.find(s => s.address.toLowerCase() === address.toLowerCase()) || null;
}

/**
 * Update or create user's agent settings
 * @param {string} address - User's wallet address
 * @param {Object} newSettings - Settings object
 * @returns {Object}
 */
export function updateUserSettings(address, newSettings) {
  const settings = loadSettings();
  const existingIndex = settings.findIndex(s => s.address.toLowerCase() === address.toLowerCase());
  
  const settingsObj = {
    address: address.toLowerCase(),
    enabled: newSettings.enabled ?? false,
    monthlyLimit: newSettings.monthlyLimit ?? 1.0, // USDC
    lastUpdated: new Date().toISOString()
  };
  
  if (existingIndex >= 0) {
    settings[existingIndex] = settingsObj;
  } else {
    settings.push(settingsObj);
  }
  
  saveSettings(settings);
  console.log(`✅ Agent settings updated for ${address}:`, settingsObj);
  
  return { success: true, settings: settingsObj };
}

/**
 * Get all users with agent enabled
 * @returns {Array}
 */
export function getEnabledUsers() {
  const settings = loadSettings();
  return settings.filter(s => s.enabled === true);
}

/**
 * Record agent purchase in history
 * @param {string} address - User's wallet address
 * @param {string} seriesId - Series ID
 * @param {string} chapterId - Chapter ID
 * @param {string} amount - Amount spent
 * @param {boolean} success - Whether purchase succeeded
 * @param {string} error - Error message if failed
 */
export function recordAgentPurchase(address, seriesId, chapterId, amount, success = true, error = null) {
  const history = loadHistory();
  
  history.push({
    address: address.toLowerCase(),
    seriesId,
    chapterId,
    amount,
    success,
    error,
    timestamp: new Date().toISOString()
  });
  
  saveHistory(history);
  
  if (success) {
    console.log(`🤖 Agent purchase recorded: ${address} -> Series ${seriesId}, Chapter ${chapterId} (${amount} USDC)`);
  } else {
    console.log(`❌ Agent purchase failed: ${address} -> Series ${seriesId}, Chapter ${chapterId}: ${error}`);
  }
}

/**
 * Get user's agent purchase history
 * @param {string} address - User's wallet address
 * @returns {Array}
 */
export function getUserHistory(address) {
  const history = loadHistory();
  return history.filter(h => h.address.toLowerCase() === address.toLowerCase());
}

/**
 * Get monthly spending for user
 * @param {string} address - User's wallet address
 * @returns {number} Total spent this month in USDC
 */
export function getMonthlySpending(address) {
  const history = loadHistory();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const monthlyPurchases = history.filter(h => 
    h.address.toLowerCase() === address.toLowerCase() &&
    h.success === true &&
    new Date(h.timestamp) >= startOfMonth
  );
  
  const total = monthlyPurchases.reduce((sum, h) => sum + parseFloat(h.amount || 0), 0);
  return parseFloat(total.toFixed(6));
}

/**
 * Reset agent history for a specific user (for testing)
 * @param {string} address - User's wallet address
 * @returns {number} Number of history entries deleted
 */
export function resetUserHistory(address) {
  const history = loadHistory();
  const initialCount = history.length;
  
  const filteredHistory = history.filter(
    h => h.address.toLowerCase() !== address.toLowerCase()
  );
  
  saveHistory(filteredHistory);
  const deletedCount = initialCount - filteredHistory.length;
  
  console.log(`🔄 Reset agent history for ${address}: ${deletedCount} record(s) deleted`);
  return deletedCount;
}
