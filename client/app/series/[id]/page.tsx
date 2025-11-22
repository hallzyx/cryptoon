"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCurrentUser, useIsSignedIn } from "@coinbase/cdp-hooks";
import { useParams } from "next/navigation";
import { FaStar, FaEye, FaHeart, FaLock, FaPlay, FaGithub, FaTwitter, FaUser } from "react-icons/fa";
import { IoSparkles } from "react-icons/io5";
import { MdTheaterComedy } from "react-icons/md";



export default function SeriesDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { currentUser } = useCurrentUser();
  const { isSignedIn } = useIsSignedIn();
  const address = currentUser?.evmAccounts?.[0];
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest");
  const [series, setSeries] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
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

            <div className="flex items-center gap-4">
              {isSignedIn && address ? (
                <>
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-purple-900/30 rounded-lg border border-purple-500/30">
                    <span className="text-xs text-purple-300">
                      {address.slice(0, 6)}...{address.slice(-4)}
                    </span>
                  </div>
                  <Link
                    href="/profile"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <FaUser />
                    <span>Profile</span>
                  </Link>
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
                <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors flex items-center gap-2">
                  <FaHeart />
                  <span>Subscribe</span>
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
                href={chapter.free ? `/read/${series.id}/${chapter.id}` : "#"}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  chapter.free
                    ? "bg-purple-900/20 border-purple-500/20 hover:bg-purple-900/30 hover:border-purple-500/40"
                    : "bg-gray-900/40 border-gray-700/40 hover:bg-gray-900/60"
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
                    {!chapter.free ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs font-medium">
                        <FaLock className="text-xs" />
                        <span>{chapter.price} USDC</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs font-medium">
                        <IoSparkles className="text-xs" />
                        <span>FREE</span>
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
