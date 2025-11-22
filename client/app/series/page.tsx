"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useCurrentUser, useIsSignedIn, useSignOut } from "@coinbase/cdp-hooks";
import { FaStar, FaEye, FaHeart, FaUser, FaGithub, FaTwitter, FaCog, FaSignOutAlt, FaWallet, FaChevronDown } from "react-icons/fa";
import { MdTheaterComedy } from "react-icons/md";

interface Series {
  id: number;
  title: string;
  author: string;
  thumbnail: string;
  genre: string;
  rating: number;
  views: string;
  likes: string;
  status: string;
  description: string;
  freeChapters: number;
  totalChapters: number;
}

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export default function SeriesPage() {
  const { currentUser } = useCurrentUser();
  const { isSignedIn } = useIsSignedIn();
  const { signOut } = useSignOut();
  const address = currentUser?.evmAccounts?.[0];
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<string>("0");
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [requestingFaucet, setRequestingFaucet] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/db.json')
      .then(res => res.json())
      .then(data => {
        setSeries(data.series);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading series:', err);
        setLoading(false);
      });
  }, []);

  // Fetch balance when address changes
  useEffect(() => {
    if (address) {
      fetchBalance();
    }
  }, [address]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchBalance = async () => {
    if (!address) return;
    
    setLoadingBalance(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/balance/${address}`);
      const data = await response.json();
      
      if (data.success) {
        setBalance(data.balance);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setLoadingBalance(false);
    }
  };

  const handleRequestFaucet = async () => {
    if (!address) return;
    
    setRequestingFaucet(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/faucet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(`Success! You received ${data.amount} ${data.token}\n\nTransaction: ${data.transactionHash}\n\nBalance will update in a few seconds.`);
        // Wait 3 seconds and refresh balance
        setTimeout(() => {
          fetchBalance();
        }, 3000);
      } else {
        alert(`Error: ${data.message || 'Failed to request faucet'}`);
      }
    } catch (error) {
      console.error('Error requesting faucet:', error);
      alert('Error requesting faucet. Please try again.');
    } finally {
      setRequestingFaucet(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowProfileMenu(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading series...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-purple-900/30 bg-black/95 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <MdTheaterComedy className="text-3xl text-purple-500" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                CRYPTOON
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/series" className="text-purple-400 font-medium">
                Series
              </Link>
              <Link href="/rankings" className="text-gray-400 hover:text-white transition-colors">
                Rankings
              </Link>
              <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                About
              </Link>
            </nav>

            {/* User Info */}
            <div className="flex items-center gap-3">
              {isSignedIn && address ? (
                <>
                  {/* Balance Display */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-900/30 to-green-800/30 rounded-lg border border-green-500/30">
                    <div className="text-right">
                      <div className="text-xs text-green-300 font-medium">
                        {loadingBalance ? (
                          <span className="animate-pulse">Loading...</span>
                        ) : (
                          <>{parseFloat(balance).toFixed(2)} USDC</>
                        )}
                      </div>
                      <div className="text-[10px] text-green-400/60">Base Sepolia</div>
                    </div>
                  </div>

                  {/* Profile Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      <FaUser />
                      <span className="hidden sm:inline">Profile</span>
                      <FaChevronDown className={`text-xs transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {showProfileMenu && (
                      <div className="absolute right-0 mt-2 w-64 bg-gray-900 border border-purple-500/30 rounded-lg shadow-xl overflow-hidden z-50">
                        {/* Wallet Address */}
                        <div className="px-4 py-3 bg-purple-900/20 border-b border-purple-500/20">
                          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                            <FaWallet />
                            <span>Wallet Address</span>
                          </div>
                          <div className="text-sm text-purple-300 font-mono">
                            {address.slice(0, 6)}...{address.slice(-4)}
                          </div>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(address);
                              alert('Address copied to clipboard!');
                            }}
                            className="text-xs text-purple-400 hover:text-purple-300 mt-1"
                          >
                            Copy full address
                          </button>
                        </div>

                        {/* Menu Options */}
                        <div className="py-1">
                          {/* Faucet Option - Always visible */}
                          <button
                            onClick={() => {
                              setShowProfileMenu(false);
                              handleRequestFaucet();
                            }}
                            disabled={requestingFaucet}
                            className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-purple-900/30 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="text-yellow-400 text-sm">💰</span>
                            <div>
                              <div className="text-sm text-white">Get Testnet USDC</div>
                              <div className="text-xs text-gray-400">Request 1 USDC</div>
                            </div>
                          </button>

                          {/* Configuration */}
                          <button
                            onClick={() => {
                              setShowProfileMenu(false);
                              alert('Configuration page coming soon!');
                            }}
                            className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-purple-900/30 transition-colors text-left"
                          >
                            <FaCog className="text-gray-400" />
                            <div>
                              <div className="text-sm text-white">Configuration</div>
                              <div className="text-xs text-gray-400">Settings & preferences</div>
                            </div>
                          </button>

                          {/* Divider */}
                          <div className="border-t border-purple-500/20 my-1"></div>

                          {/* Sign Out */}
                          <button
                            onClick={handleSignOut}
                            className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-red-900/30 transition-colors text-left text-red-400 hover:text-red-300"
                          >
                            <FaSignOutAlt />
                            <div>
                              <div className="text-sm">Sign Out</div>
                              <div className="text-xs text-gray-400">Disconnect wallet</div>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <Link
                  href="/"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-sm font-medium"
                >
                  Connect Wallet
                </Link>
              )}
            </div>
          </div>

          {/* Day Selector */}
          <div className="flex items-center gap-2 py-3 overflow-x-auto">
            {DAYS.map((day, index) => (
              <button
                key={day}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  index === 0
                    ? "bg-purple-600 text-white"
                    : "bg-purple-900/20 text-gray-400 hover:text-white hover:bg-purple-900/40"
                }`}
              >
                {day}
              </button>
            ))}
            <button className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap bg-purple-900/20 text-gray-400 hover:text-white hover:bg-purple-900/40 transition-colors">
              ALL
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative h-[400px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/50 to-black/50 z-10" />
        <img
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=400&fit=crop"
          alt="Featured"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-20 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl">
              <div className="inline-block px-3 py-1 bg-purple-600 rounded-full text-sm font-medium mb-4">
                ⭐ FEATURED
              </div>
              <h1 className="text-5xl font-bold mb-4 text-white drop-shadow-lg">
                Shadow Realm Chronicles
              </h1>
              <p className="text-lg text-gray-200 mb-6 drop-shadow-md">
                Un joven descubre un poder ancestral que lo conecta con el reino de las sombras.
              </p>
              <div className="flex items-center gap-4 mb-6">
                <span className="flex items-center gap-1 text-yellow-400">
                  <span>⭐</span>
                  <span className="font-bold">9.8</span>
                </span>
                <span className="text-gray-300">Fantasy</span>
                <span className="text-gray-300">•</span>
                <span className="text-gray-300">2.5M views</span>
              </div>
              <Link
                href="/series/1"
                className="inline-block px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
              >
                Read Now →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Series Grid */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">All Series</h2>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-purple-900/30 rounded-lg text-sm hover:bg-purple-900/50 transition-colors">
              Popular
            </button>
            <button className="px-4 py-2 text-gray-400 text-sm hover:text-white transition-colors">
              Latest
            </button>
            <button className="px-4 py-2 text-gray-400 text-sm hover:text-white transition-colors">
              Trending
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {series.map((item) => (
            <Link
              key={item.id}
              href={`/series/${item.id}`}
              className="group cursor-pointer"
            >
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 bg-purple-900/20">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* Badge */}
                <div className="absolute top-2 left-2 px-2 py-1 bg-purple-600 rounded text-xs font-medium">
                  UP
                </div>

                {/* Info overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                  <div className="flex items-center gap-2 text-xs text-gray-300 mb-1">
                    <span className="flex items-center gap-1">
                      <FaStar className="text-yellow-400" />
                      {item.rating}
                    </span>
                    <span>•</span>
                    <span>{item.views}</span>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>

              <h3 className="font-medium text-sm mb-1 line-clamp-2 group-hover:text-purple-400 transition-colors">
                {item.title}
              </h3>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{item.author}</span>
                <span className="px-2 py-0.5 bg-purple-900/30 rounded text-purple-300">
                  {item.genre}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-900/30 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-3 text-purple-400">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">How it Works</a></li>
                <li><a href="#" className="hover:text-white">For Creators</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3 text-purple-400">Community</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Discord</a></li>
                <li><a href="#" className="hover:text-white">Twitter</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3 text-purple-400">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">FAQ</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Help Center</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3 text-purple-400">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="flex items-center justify-between pt-8 border-t border-purple-900/30">
            <p className="text-sm text-gray-500">© 2025 Cryptoon. Powered by Base.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-500 hover:text-white transition-colors">
                <FaTwitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors">
                <FaGithub className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
