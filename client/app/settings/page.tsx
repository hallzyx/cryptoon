"use client";

import { useState, useEffect } from "react";
import { useCurrentUser, useIsSignedIn } from "@coinbase/cdp-hooks";
import Link from "next/link";
import { FaArrowLeft, FaRobot, FaSave, FaHistory, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

interface AgentHistoryItem {
  address: string;
  seriesId: string;
  chapterId: string;
  amount: string;
  success: boolean;
  error: string | null;
  timestamp: string;
}

export default function SettingsPage() {
  const { currentUser } = useCurrentUser();
  const address = currentUser?.evmAccounts?.[0];
  const isSignedIn = useIsSignedIn();
  
  const [settings, setSettings] = useState({
    enabled: false,
    monthlyLimit: 1.0
  });
  const [history, setHistory] = useState<AgentHistoryItem[]>([]);
  const [monthlySpent, setMonthlySpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Load settings and history
  useEffect(() => {
    if (!address) return;

    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load settings
        const settingsRes = await fetch(`http://localhost:3001/api/agent/settings/${address}`);
        const settingsData = await settingsRes.json();
        
        if (settingsData.success) {
          setSettings(settingsData.settings);
        }
        
        // Load history
        const historyRes = await fetch(`http://localhost:3001/api/agent/history/${address}`);
        const historyData = await historyRes.json();
        
        if (historyData.success) {
          setHistory(historyData.history);
          setMonthlySpent(historyData.monthlySpent);
        }
        
      } catch (error) {
        console.error("Error loading agent data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [address]);

  const handleSave = async () => {
    if (!address) return;

    try {
      setSaving(true);
      setMessage("");
      
      const response = await fetch("http://localhost:3001/api/agent/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address,
          enabled: settings.enabled,
          monthlyLimit: settings.monthlyLimit
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("Settings saved successfully! ✅");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("Failed to save settings ❌");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage("Error saving settings ❌");
    } finally {
      setSaving(false);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">⚠️ Wallet Not Connected</h1>
          <p className="text-gray-400 mb-8">Please connect your wallet to access settings.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors"
          >
            <FaArrowLeft />
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="p-2 hover:bg-purple-900/30 rounded-lg transition-colors"
          >
            <FaArrowLeft className="text-xl" />
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <FaRobot className="text-purple-400" />
              Auto-Purchase Agent Settings
            </h1>
            <p className="text-gray-400 mt-1">
              Automatically purchase new chapters from your favorite series
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading settings...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Settings Card */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <FaRobot className="text-purple-400" />
                Agent Configuration
              </h2>

              {/* Enable/Disable Toggle */}
              <div className="mb-6">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="text-lg font-medium">Enable Auto-Purchase</div>
                    <div className="text-sm text-gray-400">
                      Agent will check every minute for new chapters in your favorites
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={settings.enabled}
                      onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-8 bg-gray-700 rounded-full peer peer-checked:bg-purple-600 transition-colors"></div>
                    <div className="absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform peer-checked:translate-x-6"></div>
                  </div>
                </label>
              </div>

              {/* Monthly Limit */}
              <div className="mb-6">
                <label className="block mb-2">
                  <div className="text-lg font-medium mb-1">Monthly Spending Limit</div>
                  <div className="text-sm text-gray-400 mb-3">
                    Maximum USDC the agent can spend per month
                  </div>
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={settings.monthlyLimit}
                    onChange={(e) => setSettings({ ...settings, monthlyLimit: parseFloat(e.target.value) })}
                    className="flex-1 px-4 py-3 bg-gray-900/50 border-2 border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none"
                  />
                  <span className="text-gray-400 font-semibold">USDC</span>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  Monthly spent: {monthlySpent.toFixed(2)} / {settings.monthlyLimit.toFixed(2)} USDC
                </div>
                <div className="mt-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-pink-600 h-full transition-all"
                    style={{ width: `${Math.min((monthlySpent / settings.monthlyLimit) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex items-center gap-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30"
                >
                  <FaSave />
                  {saving ? "Saving..." : "Save Settings"}
                </button>
              </div>

              {message && (
                <div className="mt-4 p-3 bg-purple-900/30 border border-purple-500/30 rounded-lg text-center">
                  {message}
                </div>
              )}
            </div>

            {/* Purchase History */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <FaHistory className="text-purple-400" />
                Agent Purchase History
              </h2>

              {history.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <FaRobot className="text-4xl mx-auto mb-3 opacity-50" />
                  <p>No automatic purchases yet</p>
                  <p className="text-sm mt-1">Enable the agent and add series to favorites to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.slice(-10).reverse().map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-900/30 rounded-lg border border-gray-700/30"
                    >
                      <div className="flex items-center gap-3">
                        {item.success ? (
                          <FaCheckCircle className="text-green-400 text-xl" />
                        ) : (
                          <FaTimesCircle className="text-red-400 text-xl" />
                        )}
                        <div>
                          <div className="font-medium">
                            Series {item.seriesId} - Chapter {item.chapterId}
                          </div>
                          <div className="text-sm text-gray-400">
                            {new Date(item.timestamp).toLocaleString()}
                          </div>
                          {!item.success && item.error && (
                            <div className="text-xs text-red-400 mt-1">{item.error}</div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{item.amount} USDC</div>
                        <div className={`text-sm ${item.success ? 'text-green-400' : 'text-red-400'}`}>
                          {item.success ? 'Success' : 'Failed'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
