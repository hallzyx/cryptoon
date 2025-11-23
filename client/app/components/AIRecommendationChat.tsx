"use client";

import { useState } from "react";
import { useCurrentUser, useX402 } from "@coinbase/cdp-hooks";
import { FaRobot, FaTimes, FaSpinner } from "react-icons/fa";
import { IoSparkles } from "react-icons/io5";
import { useBalance } from "../contexts/BalanceContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export default function AIRecommendationChat() {
  const { currentUser } = useCurrentUser();
  const { fetchWithPayment } = useX402();
  const { refreshBalance } = useBalance();
  const address = currentUser?.evmAccounts?.[0];
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState("");

  const handleSendMessage = () => {
    if (!input.trim() || !address) return;
    
    setPendingPrompt(input);
    setShowConfirmModal(true);
  };

  const handleConfirmPayment = async () => {
    if (!address || !pendingPrompt) return;
    
    setShowConfirmModal(false);
    setLoading(true);
    
    // Add user message
    setMessages(prev => [...prev, { role: "user", content: pendingPrompt }]);
    setInput("");
    
    try {
      const response = await fetchWithPayment(`${API_URL}/api/recommendations/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: address,
          prompt: pendingPrompt,
        }),
      });

      const data = await response.json();
      
      // Refresh balance after payment
      setTimeout(() => refreshBalance(), 2000);
      setTimeout(() => refreshBalance(), 5000);
      
      if (data.success) {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: data.recommendation || "Here are some recommendations based on your preferences!"
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: "system",
          content: `Error: ${data.error || "Failed to get recommendation"}`
        }]);
      }
    } catch (error: any) {
      console.error("Error getting recommendation:", error);
      setMessages(prev => [...prev, {
        role: "system",
        content: `Error: ${error.message || "Failed to connect to server"}`
      }]);
    } finally {
      setLoading(false);
      setPendingPrompt("");
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-500 hover:from-purple-500 hover:via-purple-400 hover:to-indigo-400 rounded-full shadow-xl shadow-purple-900/50 border border-purple-400/30 backdrop-blur-sm transition-all hover:scale-110 hover:shadow-purple-700/60"
        >
          <FaRobot className="text-2xl text-white" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[500px] bg-gradient-to-b from-gray-900 to-black border border-purple-500/30 rounded-2xl shadow-2xl shadow-purple-500/20 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-purple-500/30 bg-purple-900/20">
            <div className="flex items-center gap-2">
              <FaRobot className="text-purple-400 text-xl" />
              <h3 className="font-bold text-white">AI Recommendations</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FaTimes />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 mt-8">
                <IoSparkles className="text-4xl mx-auto mb-2 text-purple-400" />
                <p className="text-sm">Ask me for manga/webtoon recommendations!</p>
                <p className="text-xs mt-1">Cost: 0.01 USDC per recommendation</p>
              </div>
            )}
            
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === "user"
                      ? "bg-purple-600 text-white"
                      : msg.role === "system"
                      ? "bg-red-900/30 text-red-400 border border-red-500/30"
                      : "bg-gray-800 text-gray-200"
                  }`}
                >
                  {msg.role === "user" || msg.role === "system" ? (
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <div className="text-sm prose-chat">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 p-3 rounded-lg flex items-center gap-2">
                  <FaSpinner className="animate-spin text-purple-400" />
                  <span className="text-sm text-gray-300">Generating recommendation...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-purple-500/30 bg-gradient-to-b from-gray-900 to-black">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="What kind of story are you looking for?"
                disabled={loading || !address}
                className="flex-1 px-4 py-3 bg-gray-800/90 border-2 border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:bg-gray-800 disabled:opacity-50 transition-all"
              />
              <button
                onClick={handleSendMessage}
                disabled={loading || !input.trim() || !address}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 shadow-lg shadow-purple-500/30"
              >
                Send
              </button>
            </div>
            {!address && (
              <p className="text-xs text-yellow-400 mt-2">Please connect your wallet first</p>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-gradient-to-b from-gray-900 to-black border border-purple-500/30 rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <IoSparkles className="text-4xl mx-auto mb-3 text-yellow-400" />
              <h3 className="text-xl font-bold text-white mb-2">💰 Confirmation Required</h3>
              <p className="text-gray-400 text-sm">This recommendation will cost:</p>
              <p className="text-3xl font-bold text-purple-400 mt-2">0.01 USDC</p>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-300">
                <strong>Your prompt:</strong>
              </p>
              <p className="text-sm text-gray-400 mt-1 italic">"{pendingPrompt}"</p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setPendingPrompt("");
                }}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPayment}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 rounded-lg transition-colors font-medium"
              >
                Proceed with Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
