"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCurrentUser, useIsSignedIn } from "@coinbase/cdp-hooks";
import { FaStar, FaEye, FaHeart, FaArrowLeft, FaTrash } from "react-icons/fa";
import { IoSparkles } from "react-icons/io5";
import { useFavorites } from "../contexts/FavoritesContext";

export default function FavoritesPage() {
  const { currentUser } = useCurrentUser();
  const { isSignedIn } = useIsSignedIn();
  const address = currentUser?.evmAccounts?.[0];
  const { favorites, loading, toggleFavorite } = useFavorites();
  const [seriesData, setSeriesData] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    // Load full series data for favorites
    const loadSeriesData = async () => {
      setLoadingData(true);
      try {
        const response = await fetch('/db.json');
        const data = await response.json();
        
        // Match favorites with full series data
        const favoriteSeries = favorites.map(fav => {
          const series = data.series.find((s: any) => s.id.toString() === fav.seriesId);
          return series ? { ...series, favoriteTimestamp: fav.timestamp } : null;
        }).filter(Boolean);
        
        setSeriesData(favoriteSeries);
      } catch (error) {
        console.error('Error loading series data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    if (favorites.length > 0) {
      loadSeriesData();
    } else {
      setSeriesData([]);
      setLoadingData(false);
    }
  }, [favorites]);

  const handleRemoveFavorite = async (seriesId: string, seriesTitle: string) => {
    if (window.confirm(`Remove "${seriesTitle}" from favorites?`)) {
      await toggleFavorite(seriesId, seriesTitle, '');
    }
  };

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <FaHeart className="text-6xl text-purple-500 mx-auto mb-4 opacity-50" />
          <h1 className="text-3xl font-bold mb-4">My Favorites</h1>
          <p className="text-gray-400 mb-6">
            Connect your wallet to view your favorite series
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            <FaArrowLeft />
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-purple-500/20 bg-gradient-to-b from-purple-900/20 to-transparent">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <FaArrowLeft />
              <span>Back to Home</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-3 mb-2">
            <FaHeart className="text-3xl text-pink-500" />
            <h1 className="text-4xl font-bold">My Favorites</h1>
          </div>
          
          <p className="text-gray-400">
            {favorites.length === 0 
              ? "You haven't added any favorites yet" 
              : `${favorites.length} series in your collection`
            }
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {seriesData.length === 0 ? (
          <div className="text-center py-20">
            <IoSparkles className="text-6xl text-purple-500 mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-bold mb-2">No favorites yet</h2>
            <p className="text-gray-400 mb-6">
              Browse series and click the heart button to add them to your favorites
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 rounded-lg transition-all"
            >
              <IoSparkles />
              Explore Series
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {seriesData.map((series: any) => (
              <div
                key={series.id}
                className="group relative"
              >
                {/* Series Card */}
                <Link href={`/series/${series.id}`}>
                  <div className="aspect-[2/3] rounded-xl overflow-hidden mb-3 relative shadow-lg transition-transform group-hover:scale-105 border-2 border-pink-500/30">
                    <img
                      src={series.thumbnail}
                      alt={series.title}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <div className="flex items-center gap-2 text-xs mb-1">
                          <div className="flex items-center gap-1 text-yellow-400">
                            <FaStar />
                            <span>{series.rating}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-300">
                            <FaEye />
                            <span>{series.views}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Favorite Badge */}
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-pink-600 to-rose-600 rounded-full p-2 shadow-lg">
                      <FaHeart className="text-white text-sm" />
                    </div>
                  </div>
                </Link>

                {/* Info */}
                <div className="space-y-3">
                  <Link href={`/series/${series.id}`}>
                    <h3 className="font-semibold line-clamp-2 group-hover:text-purple-400 transition-colors">
                      {series.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-400 line-clamp-1">{series.author}</p>
                  
                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveFavorite(series.id.toString(), series.title)}
                    className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white rounded-lg transition-all flex items-center justify-center gap-3 text-sm shadow-lg shadow-red-500/20 hover:shadow-red-500/40 hover:scale-105"
                  >
                    <FaTrash className="text-xs" />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
