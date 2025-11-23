"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCurrentUser, useIsSignedIn, useX402 } from "@coinbase/cdp-hooks";
import { FaArrowLeft, FaArrowRight, FaHome, FaList, FaHeart, FaComment, FaShare, FaLock, FaWallet } from "react-icons/fa";
import { MdTheaterComedy } from "react-icons/md";
import { useBalance } from "@/app/contexts/BalanceContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function ReadChapterPage() {
  const params = useParams();
  const router = useRouter();
  const seriesId = params?.seriesId as string;
  const chapterId = params?.chapterId as string;
  const { currentUser } = useCurrentUser();
  const { isSignedIn } = useIsSignedIn();
  const { fetchWithPayment } = useX402();
  const { refreshBalance } = useBalance();
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [liked, setLiked] = useState(false);
  const [chapter, setChapter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [paymentRequired, setPaymentRequired] = useState<any>(null);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const address = currentUser?.evmAccounts?.[0];

  useEffect(() => {
    loadChapter();
  }, [seriesId, chapterId, address]);

  const loadChapter = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to load chapter (free or already purchased)
      const freeUrl = `${API_URL}/api/chapter-free/${seriesId}/${chapterId}${address ? `?address=${address}` : ''}`;
      
      console.log('📖 Loading chapter from:', freeUrl);

      const freeResponse = await fetch(freeUrl);
      
      if (freeResponse.ok) {
        // It's a free chapter OR user already purchased it
        const data = await freeResponse.json();
        console.log('✅ Chapter loaded:', data);
        setChapter(data.chapter);
        setIsLocked(false);
        setIsPremium(!data.free); // If not free, it's premium but already purchased
        setLoading(false);
        return;
      }

      // If 403, it's a premium chapter that hasn't been purchased
      if (freeResponse.status === 403) {
        console.log('🔒 Premium chapter - payment required');
        
        // Get chapter metadata from db.json for display
        const dbResponse = await fetch('/db.json');
        const db = await dbResponse.json();
        const series = db.series.find((s: any) => s.id === parseInt(seriesId));
        const chapterMeta = series?.chapters.find((c: any) => c.id === parseInt(chapterId));
        
        setChapter({ 
          title: chapterMeta?.title || `Chapter ${chapterId}`, 
          seriesTitle: series?.title || 'Loading...',
          id: chapterId 
        });
        
        setIsLocked(true);
        setIsPremium(true);
        setPaymentRequired({
          price: "0.01",
          network: "base-sepolia",
          receiver: "0x6f21c2155bf93b49348a422a604310f8ccd6ec74"
        });
        setLoading(false);
        return;
      }

      // If we get here, something unexpected happened
      throw new Error('Failed to load chapter');
      
      setLoading(false);
    } catch (err: any) {
      console.error('❌ Error loading chapter:', err);
      setError(err.message || 'Failed to load chapter');
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!address || !currentUser || !paymentRequired) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      setPaying(true);
      setError(null);
      
      console.log('🔐 Initiating payment with useX402...');
      
      const url = `${API_URL}/api/chapters/${seriesId}/${chapterId}?address=${address}`;
      
      // Use fetchWithPayment from useX402 hook (just like the demo)
      const response = await fetchWithPayment(url, {
        method: "GET",
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        throw new Error(`Payment failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Received data:', data);

      if (data.chapter) {
        console.log('🎉 Chapter unlocked successfully!');
        setChapter(data.chapter);
        setIsLocked(false);
        setPaymentRequired(null);
        
        // Refresh balance after payment
        setTimeout(() => refreshBalance(), 2000);
        setTimeout(() => refreshBalance(), 5000);
      } else {
        throw new Error(data.error || 'Payment failed');
      }
      
      setPaying(false);
    } catch (err: any) {
      console.error('❌ Payment error:', err);
      setError(err.message || 'Payment failed');
      setPaying(false);
    }
  };

  // Auto-hide header on scroll down
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading chapter...</p>
        </div>
      </div>
    );
  }

  if (error && !chapter) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-4">Error Loading Chapter</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link 
            href={`/series/${seriesId}`}
            className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            Back to Series
          </Link>
        </div>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Chapter not found</h1>
          <Link href="/series" className="text-purple-400 hover:text-purple-300">
            Back to Series
          </Link>
        </div>
      </div>
    );
  }

  // Premium Locked Chapter View
  if (isLocked && paymentRequired) {
    return (
      <div className="min-h-screen bg-black text-white">
        <header className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-purple-900/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link
                href={`/series/${seriesId}`}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <FaArrowLeft />
                <span>Back</span>
              </Link>
              <Link href="/series" className="flex items-center gap-2">
                <MdTheaterComedy className="text-2xl text-purple-500" />
                <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                  CRYPTOON
                </span>
              </Link>
              <div className="w-20"></div>
            </div>
          </div>
        </header>

        <main className="pt-16 min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            {/* Locked Chapter Card */}
            <div className="bg-gradient-to-b from-purple-900/30 to-black border border-purple-500/30 rounded-2xl p-8 text-center">
              {/* Lock Icon */}
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-900/50 rounded-full border-2 border-purple-500/50">
                  <FaLock className="text-4xl text-purple-400" />
                </div>
              </div>

              {/* Chapter Info */}
              <h2 className="text-2xl font-bold mb-2">{chapter.title}</h2>
              <p className="text-gray-400 mb-6">{chapter.seriesTitle}</p>

              {/* Premium Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-800 rounded-full mb-8">
                <span className="text-sm font-medium">Premium Chapter</span>
              </div>

              {/* Price */}
              <div className="mb-8 p-4 bg-black/50 rounded-lg border border-purple-500/20">
                <p className="text-sm text-gray-400 mb-1">Price</p>
                <p className="text-3xl font-bold text-purple-400">
                  {paymentRequired.price} USDC
                </p>
                <p className="text-xs text-gray-500 mt-1">on {paymentRequired.network}</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Pay Button */}
              {isSignedIn && currentUser ? (
                <button
                  onClick={handlePayment}
                  disabled={paying}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 rounded-lg transition-all font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {paying ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Processing Payment...</span>
                    </>
                  ) : (
                    <>
                      <FaWallet />
                      <span>Unlock Chapter</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-400 text-sm">Please connect your wallet to unlock this chapter</p>
                  <button
                    onClick={() => router.push('/series')}
                    className="w-full px-6 py-4 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors font-medium"
                  >
                    Connect Wallet
                  </button>
                </div>
              )}

              {/* Additional Info */}
              <div className="mt-8 pt-6 border-t border-purple-900/30">
                <p className="text-xs text-gray-500">
                  This is a one-time purchase. Once unlocked, you can read this chapter anytime.
                </p>
              </div>
            </div>

            {/* Back Link */}
            <div className="text-center mt-6">
              <Link
                href={`/series/${seriesId}`}
                className="text-purple-400 hover:text-purple-300 transition-colors text-sm"
              >
                ← Back to Chapter List
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header - Auto-hide on scroll */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-purple-900/30 transition-transform duration-300 ${
          showHeader ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left - Back & Info */}
            <div className="flex items-center gap-4 flex-1">
              <Link
                href={`/series/${seriesId}`}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <FaArrowLeft />
                <span className="hidden sm:inline">Back</span>
              </Link>
              <div className="hidden md:block border-l border-purple-900/30 pl-4">
                <h1 className="text-sm font-medium text-gray-300 line-clamp-1">
                  {chapter.seriesTitle}
                </h1>
                <p className="text-xs text-gray-500">
                  Chapter {chapter.id}: {chapter.title}
                </p>
              </div>
            </div>

            {/* Center - Logo */}
            <Link href="/series" className="flex items-center gap-2">
              <MdTheaterComedy className="text-2xl text-purple-500" />
              <span className="hidden sm:inline text-lg font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                CRYPTOON
              </span>
              {isPremium && !isLocked && (
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-600 to-purple-800 rounded-full text-xs">
                  <span>✨</span>
                  <span>Premium</span>
                </span>
              )}
            </Link>

            {/* Right - Actions */}
            <div className="flex items-center gap-2 flex-1 justify-end">
              <button
                onClick={() => setLiked(!liked)}
                className={`p-2 rounded-lg transition-colors ${
                  liked
                    ? "text-red-500 bg-red-500/10"
                    : "text-gray-400 hover:text-white hover:bg-purple-900/30"
                }`}
              >
                <FaHeart />
              </button>
              <button className="p-2 text-gray-400 hover:text-white hover:bg-purple-900/30 rounded-lg transition-colors">
                <FaComment />
              </button>
              <button className="p-2 text-gray-400 hover:text-white hover:bg-purple-900/30 rounded-lg transition-colors">
                <FaShare />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Reader Content - Vertical Scroll (Webtoon Style) */}
      <main className="pt-16">
        <div className="max-w-3xl mx-auto">
          {/* Chapter Images */}
          <div className="space-y-0">
            {chapter.images.map((image: string, index: number) => (
              <div key={index} className="w-full">
                <img
                  src={image}
                  alt={`${chapter.title} - Panel ${index + 1}`}
                  className="w-full h-auto"
                  loading={index > 2 ? "lazy" : "eager"}
                />
              </div>
            ))}
          </div>

          {/* End of Chapter Card */}
          <div className="p-8 bg-gradient-to-b from-purple-900/20 to-black border-t border-purple-500/30">
            <div className="text-center max-w-md mx-auto space-y-6">
              <h2 className="text-2xl font-bold">End of Chapter {chapter.id}</h2>
              <p className="text-gray-400">{chapter.title}</p>

              {/* Navigation Buttons */}
              <div className="flex gap-4 justify-center pt-4">
                {chapter.prevChapter && (
                  <Link
                    href={`/read/${seriesId}/${chapter.prevChapter}`}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-900/30 hover:bg-purple-900/50 rounded-lg transition-colors border border-purple-500/30"
                  >
                    <FaArrowLeft />
                    <span>Previous</span>
                  </Link>
                )}
                <Link
                  href={`/series/${seriesId}`}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-900/30 hover:bg-purple-900/50 rounded-lg transition-colors border border-purple-500/30"
                >
                  <FaList />
                  <span>Chapters</span>
                </Link>
                {chapter.nextChapter ? (
                  <Link
                    href={`/read/${seriesId}/${chapter.nextChapter}`}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors font-medium"
                  >
                    <span>Next</span>
                    <FaArrowRight />
                  </Link>
                ) : (
                  <div className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 rounded-lg text-gray-500 border border-gray-700">
                    <span>Coming Soon</span>
                  </div>
                )}
              </div>

              {/* Back to Series */}
              <Link
                href={`/series/${seriesId}`}
                className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
              >
                <FaHome />
                <span>Back to {chapter.seriesTitle}</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Navigation (Bottom) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-sm border-t border-purple-900/30 md:hidden">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            {chapter.prevChapter ? (
              <Link
                href={`/read/${seriesId}/${chapter.prevChapter}`}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-900/30 rounded-lg text-sm"
              >
                <FaArrowLeft />
                <span>Prev</span>
              </Link>
            ) : (
              <div className="flex-1" />
            )}
            <Link
              href={`/series/${seriesId}`}
              className="px-4 py-2 bg-purple-900/30 rounded-lg text-sm"
            >
              <FaList />
            </Link>
            {chapter.nextChapter ? (
              <Link
                href={`/read/${seriesId}/${chapter.nextChapter}`}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 rounded-lg text-sm font-medium"
              >
                <span>Next</span>
                <FaArrowRight />
              </Link>
            ) : (
              <div className="flex-1" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
