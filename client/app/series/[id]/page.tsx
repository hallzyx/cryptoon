"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useCurrentUser, useIsSignedIn, useSignOut } from "@coinbase/cdp-hooks";
import { useParams } from "next/navigation";
import { FaStar, FaEye, FaHeart, FaLock, FaPlay, FaGithub, FaTwitter, FaUser, FaCog, FaSignOutAlt, FaWallet, FaChevronDown } from "react-icons/fa";
import { IoSparkles } from "react-icons/io5";
import { MdTheaterComedy } from "react-icons/md";
import { useBalance } from "@/app/contexts/BalanceContext";
import { useFavorites } from "@/app/contexts/FavoritesContext";



export default function SeriesDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { currentUser } = useCurrentUser();
  const { isSignedIn } = useIsSignedIn();
  const { signOut } = useSignOut();
  const address = currentUser?.evmAccounts?.[0];
  const { balance, loading: loadingBalance, refreshBalance } = useBalance();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest");
  const [series, setSeries] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [requestingFaucet, setRequestingFaucet] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [purchasedChapters, setPurchasedChapters] = useState<Set<string>>(new Set());
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    fetch('/db.json')
      .then(res => res.json())
      .then(data => {
        const foundSeries = data.series.find((s: any) => s.id.toString() === id);
        setSeries(foundSeries);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading series:', err);
        setLoading(false);
      });
  }, [id]);

  // Fetch purchases when address changes
  useEffect(() => {
    if (address) {
      fetchPurchases();
    }
  }, [address, id]);

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

  const fetchPurchases = async () => {
    if (!address) return;
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/purchases/${address}`);
      const data = await response.json();
      
      if (data.success) {
        // Create a Set of "seriesId_chapterId" keys for quick lookup
        const purchased = new Set<string>(
          data.purchases
            .filter((p: any) => p.seriesId === id)
            .map((p: any) => `${p.seriesId}_${p.chapterId}`)
        );
        setPurchasedChapters(purchased);
        console.log('💰 Purchased chapters loaded:', purchased.size);
      }
    } catch (error) {
      console.error('Error fetching purchases:', error);
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
        setTimeout(() => refreshBalance(), 2000);
        setTimeout(() => refreshBalance(), 5000);
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
  
  // Ordenar capítulos según el estado
  const sortedChapters = series ? [...series.chapters].sort((a: any, b: any) => {
    return sortOrder === "latest" ? b.id - a.id : a.id - b.id;
  }) : [];

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

  if (!series) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Series not found</h1>
        <Link href="/series" className="text-purple-400 hover:text-purple-300">
          ← Back to series
        </Link>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-purple-900/30 bg-black/95 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/series" className="flex items-center gap-2">
              <MdTheaterComedy className="text-3xl text-purple-500" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                CRYPTOON
              </span>
            </Link>

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
                          {/* Faucet Option */}
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

                          {/* Favorites */}
                          <Link
                            href="/favorites"
                            onClick={() => setShowProfileMenu(false)}
                            className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-purple-900/30 transition-colors text-left"
                          >
                            <FaHeart className="text-pink-400" />
                            <div>
                              <div className="text-sm text-white">My Favorites</div>
                              <div className="text-xs text-gray-400">View saved series</div>
                            </div>
                          </Link>

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
        </div>
      </header>

      {/* Banner */}
      <div className="relative h-[300px] md:h-[400px]">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
        <img
          src={series.banner}
          alt={series.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Series Info */}
      <div className="container mx-auto px-4 -mt-32 relative z-20">
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          {/* Thumbnail */}
          <div className="w-48 flex-shrink-0">
            <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border-4 border-black">
              <img
                src={series.thumbnail}
                alt={series.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="bg-gradient-to-br from-purple-900/40 to-black/40 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">{series.title}</h1>
                  <p className="text-gray-400">by {series.author}</p>
                </div>
                <button 
                  onClick={() => toggleFavorite(id, series.title, series.thumbnail)}
                  disabled={!address}
                  className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    isFavorite(id)
                      ? 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 shadow-lg shadow-pink-500/30'
                      : 'bg-purple-600 hover:bg-purple-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <FaHeart className={isFavorite(id) ? 'animate-pulse' : ''} />
                  <span>{isFavorite(id) ? 'Favorited' : 'Add to Favorites'}</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center gap-1 text-yellow-400">
                  <FaStar />
                  <span className="font-bold">{series.rating}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-300">
                  <FaEye />
                  <span>{series.views} views</span>
                </div>
                <div className="flex items-center gap-1 text-gray-300">
                  <FaHeart />
                  <span>{series.likes} likes</span>
                </div>
                <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                  {series.status}
                </div>
                <div className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                  Every {series.releaseDay}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {series.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-purple-900/40 text-purple-300 rounded-lg text-sm border border-purple-500/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <p className="text-gray-300 leading-relaxed">
                {series.description}
              </p>
            </div>
          </div>
        </div>

        {/* Chapters Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Episodes</h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setSortOrder("latest")}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  sortOrder === "latest" 
                    ? "bg-purple-600 text-white" 
                    : "bg-purple-900/30 text-gray-400 hover:bg-purple-900/50 hover:text-white"
                }`}
              >
                Latest First
              </button>
              <button 
                onClick={() => setSortOrder("oldest")}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  sortOrder === "oldest" 
                    ? "bg-purple-600 text-white" 
                    : "bg-purple-900/30 text-gray-400 hover:bg-purple-900/50 hover:text-white"
                }`}
              >
                Oldest First
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {sortedChapters.map((chapter: any) => (
              <Link
                key={chapter.id}
                href={`/read/${series.id}/${chapter.id}`}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  chapter.free
                    ? "bg-purple-900/20 border-purple-500/20 hover:bg-purple-900/30 hover:border-purple-500/40"
                    : "bg-gray-900/40 border-gray-700/40 hover:bg-gray-900/60 cursor-pointer"
                }`}
              >
                {/* Thumbnail */}
                <div className="w-16 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-purple-900/20">
                  <img
                    src={chapter.thumbnail}
                    alt={chapter.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-lg truncate">
                      Episode {chapter.id}: {chapter.title}
                    </h3>
                    {chapter.free ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs font-medium">
                        <IoSparkles className="text-xs" />
                        <span>FREE</span>
                      </span>
                    ) : purchasedChapters.has(`${series.id}_${chapter.id}`) ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded text-xs font-medium">
                        <IoSparkles className="text-xs" />
                        <span>OWNED</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs font-medium">
                        <FaLock className="text-xs" />
                        <span>{chapter.price} USDC</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>{chapter.date}</span>
                    <span className="flex items-center gap-1">
                      <FaEye />
                      {chapter.views}
                    </span>
                  </div>
                </div>

                {/* Action */}
                <div className="flex-shrink-0">
                  {chapter.free ? (
                    <div className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                      <FaPlay className="text-xs" />
                      <span>Read</span>
                    </div>
                  ) : purchasedChapters.has(`${series.id}_${chapter.id}`) ? (
                    <div className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-amber-500/20">
                      <FaPlay className="text-xs" />
                      <span>Read</span>
                    </div>
                  ) : (
                    <div className="px-4 py-2 bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 rounded-lg text-sm font-medium transition-colors border border-yellow-500/30 flex items-center gap-2">
                      <FaLock className="text-xs" />
                      <span>Unlock</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Comments Section Placeholder */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Comments</h2>
          <div className="bg-purple-900/20 border border-purple-500/20 rounded-xl p-8 text-center">
            <p className="text-gray-400">Comments section coming soon...</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-purple-900/30 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
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
