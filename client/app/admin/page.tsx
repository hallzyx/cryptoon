"use client";

import { useState, useEffect } from "react";
import { useCurrentUser } from "@coinbase/cdp-hooks";

interface AgentWallet {
  address: string;
  balance: string;
  network: string;
}

export default function AdminPage() {
  const { currentUser } = useCurrentUser();
  const address = currentUser?.evmAccounts?.[0];
  const [isResetting, setIsResetting] = useState(false);
  const [isFunding, setIsFunding] = useState(false);
  const [isFundingEth, setIsFundingEth] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [agentWallet, setAgentWallet] = useState<AgentWallet | null>(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);

  // Load agent wallet info on mount and setup auto-refresh
  useEffect(() => {
    loadAgentWallet();
    
    // Auto-refresh every 5 seconds to show real-time balance changes
    const interval = setInterval(() => {
      loadAgentWallet();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const loadAgentWallet = async () => {
    try {
      setIsLoadingWallet(true);
      const response = await fetch("http://localhost:3001/api/agent/wallet");
      const data = await response.json();
      
      if (data.success) {
        setAgentWallet({
          address: data.address,
          balance: data.balance,
          network: data.network
        });
      }
    } catch (error) {
      console.error("Error loading agent wallet:", error);
    } finally {
      setIsLoadingWallet(false);
    }
  };

  const handleFundAgent = async () => {
    setIsFunding(true);
    setMessage("");
    setMessageType("");

    try {
      const response = await fetch("http://localhost:3001/api/agent/fund", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        setMessage(
          `✅ Agent wallet funded successfully!\n\n` +
          `💰 New balance: ${data.balance} USDC\n` +
          `📍 Address: ${data.agentAddress}\n\n` +
          `🎉 The agent can now auto-purchase chapters!`
        );
        setMessageType("success");
        
        // Reload wallet info
        await loadAgentWallet();
      } else {
        setMessage(`❌ ${data.error || "Failed to fund agent wallet"}`);
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error funding agent wallet:", error);
      setMessage(`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      setMessageType("error");
    } finally {
      setIsFunding(false);
    }
  };

  const handleFundAgentEth = async () => {
    setIsFundingEth(true);
    setMessage("");
    setMessageType("");

    try {
      const response = await fetch("http://localhost:3001/api/agent/fund-eth", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        setMessage(
          `✅ Agent wallet funded with ETH!\n\n` +
          `⛽ This enables gas for transactions\n` +
          `📍 Address: ${data.agentAddress}\n\n` +
          `🎉 Ready for USDC transfers!`
        );
        setMessageType("success");
        
        // Reload wallet info
        await loadAgentWallet();
      } else {
        setMessage(`❌ ${data.error || "Failed to fund agent with ETH"}`);
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error funding agent with ETH:", error);
      setMessage(`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      setMessageType("error");
    } finally {
      setIsFundingEth(false);
    }
  };

  const handleReset = async () => {
    if (!address) {
      setMessage("❌ Please connect your wallet first");
      setMessageType("error");
      return;
    }

    if (!confirm("⚠️ Are you sure you want to reset ALL your purchases and agent history?\n\nThis will:\n- Delete all manual purchases (x402)\n- Delete all agent auto-purchases\n- Reset monthly spending counter\n\nThis action cannot be undone!")) {
      return;
    }

    setIsResetting(true);
    setMessage("");
    setMessageType("");

    try {
      const response = await fetch(`http://localhost:3001/api/reset/${address}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setMessage(
          `✅ Reset successful!\n\n` +
          `📦 Deleted:\n` +
          `  • ${data.deleted.purchases} manual purchase(s)\n` +
          `  • ${data.deleted.history} agent purchase(s)\n` +
          `  • Total: ${data.deleted.total} record(s)\n\n` +
          `🔄 Refresh the page to see changes.`
        );
        setMessageType("success");
        
        // Auto-reload after 3 seconds
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } else {
        setMessage(`❌ ${data.error || "Failed to reset purchases"}`);
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error resetting purchases:", error);
      setMessage(`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      setMessageType("error");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-indigo-900 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            🧪 Testing Tools
          </h1>
          <p className="text-purple-200 mb-8">
            Developer utilities for testing the auto-purchase agent
          </p>

          {/* Agent Wallet Info */}
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-500/30">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                🤖 Agent Wallet
                {!isLoadingWallet && (
                  <span className="text-xs text-green-400 font-normal">● Live</span>
                )}
              </h2>
              <button
                onClick={loadAgentWallet}
                disabled={isLoadingWallet}
                className="text-sm px-3 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
              >
                {isLoadingWallet ? "⏳" : "🔄"} Refresh
              </button>
            </div>
            
            {agentWallet ? (
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-purple-300 mb-1">Address</div>
                  <div className="font-mono text-xs text-white bg-black/30 p-2 rounded break-all">
                    {agentWallet.address}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-purple-300 mb-1">Balance</div>
                    <div className="text-2xl font-bold text-white">
                      {agentWallet.balance} USDC
                    </div>
                    <div className="text-xs text-purple-400 mt-1">
                      Auto-updates every 5 seconds
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-purple-300 mb-1">Network</div>
                    <div className="text-sm font-semibold text-blue-300">
                      {agentWallet.network}
                    </div>
                  </div>
                </div>
                
                
                {/* Fund Buttons - Always visible */}
                <div className="mt-4 space-y-2">
                  <button
                    onClick={handleFundAgent}
                    disabled={isFunding}
                    className={`
                      w-full py-2 px-4 rounded-lg font-semibold text-sm
                      transition-all duration-200 flex items-center justify-center gap-2
                      ${
                        isFunding
                          ? "bg-gray-500/30 text-gray-400 cursor-not-allowed"
                          : "bg-green-500 hover:bg-green-600 text-white shadow-lg"
                      }
                    `}
                  >
                    {isFunding ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Funding USDC...
                      </>
                    ) : (
                      <>
                        💰 Fund USDC (for purchases)
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleFundAgentEth}
                    disabled={isFundingEth}
                    className={`
                      w-full py-2 px-4 rounded-lg font-semibold text-sm
                      transition-all duration-200 flex items-center justify-center gap-2
                      ${
                        isFundingEth
                          ? "bg-gray-500/30 text-gray-400 cursor-not-allowed"
                          : "bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
                      }
                    `}
                  >
                    {isFundingEth ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Funding ETH...
                      </>
                    ) : (
                      <>
                        ⛽ Fund ETH (for gas fees)
                      </>
                    )}
                  </button>
                </div>
                
                {parseFloat(agentWallet.balance) < 0.1 && (
                  <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/40 rounded-lg">
                    <div className="text-yellow-300 text-sm">
                      ⚠️ Low USDC balance! Use buttons above to fund the agent.
                    </div>
                  </div>
                )}                {/* Basescan Link */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <a
                    href={`https://sepolia.basescan.org/address/${agentWallet.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 text-sm text-blue-300 hover:text-blue-200 transition-colors"
                  >
                    <span>🔍 View on Basescan</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-purple-300">
                {isLoadingWallet ? "Loading wallet info..." : "Unable to load wallet info"}
              </div>
            )}
          </div>

          {/* Wallet Status */}
          <div className="mb-8 p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="text-sm text-purple-300 mb-1">Your Connected Wallet</div>
            {address ? (
              <div className="font-mono text-white break-all">{address}</div>
            ) : (
              <div className="text-red-400">❌ Not connected</div>
            )}
          </div>

          {/* Reset Section */}
          <div className="bg-red-500/10 border-2 border-red-500/30 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="text-3xl">🔄</div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Reset All Purchases
                </h2>
                <p className="text-purple-200 text-sm mb-4">
                  This will permanently delete:
                </p>
                <ul className="text-sm text-purple-300 space-y-1 mb-4">
                  <li>• All manual purchases made via x402</li>
                  <li>• All agent auto-purchases</li>
                  <li>• Agent purchase history</li>
                  <li>• Monthly spending counter</li>
                </ul>
                <p className="text-yellow-300 text-sm font-semibold">
                  ⚠️ This action cannot be undone!
                </p>
              </div>
            </div>

            <button
              onClick={handleReset}
              disabled={!address || isResetting}
              className={`
                w-full py-3 px-6 rounded-lg font-semibold
                transition-all duration-200 flex items-center justify-center gap-2
                ${
                  !address || isResetting
                    ? "bg-gray-500/30 text-gray-400 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl"
                }
              `}
            >
              {isResetting ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Resetting...
                </>
              ) : (
                <>
                  🗑️ Reset All Data
                </>
              )}
            </button>
          </div>

          {/* Message Display */}
          {message && (
            <div
              className={`
                p-4 rounded-lg border whitespace-pre-line
                ${
                  messageType === "success"
                    ? "bg-green-500/10 border-green-500/30 text-green-300"
                    : "bg-red-500/10 border-red-500/30 text-red-300"
                }
              `}
            >
              {message}
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              📝 Testing Workflow
            </h3>
            <ol className="text-sm text-purple-200 space-y-2 list-decimal list-inside">
              <li>Enable auto-purchase agent in Settings</li>
              <li>Mark some series as favorites</li>
              <li>Wait 60 seconds for agent to purchase chapters</li>
              <li>Verify purchases appear in your library</li>
              <li>Use this reset tool to clear everything</li>
              <li>Repeat to test different scenarios</li>
            </ol>
          </div>

          {/* API Endpoint Info */}
          <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-sm font-semibold text-white mb-2">🔌 API Endpoint</h3>
            <div className="font-mono text-xs text-purple-300 break-all">
              DELETE http://localhost:3001/api/reset/:address
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
