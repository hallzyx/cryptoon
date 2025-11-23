"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useCurrentUser } from "@coinbase/cdp-hooks";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Favorite {
  address: string;
  seriesId: string;
  seriesTitle: string;
  seriesCover: string;
  timestamp: string;
}

interface FavoritesContextType {
  favorites: Favorite[];
  loading: boolean;
  isFavorite: (seriesId: string) => boolean;
  toggleFavorite: (seriesId: string, seriesTitle: string, seriesCover: string) => Promise<void>;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType>({
  favorites: [],
  loading: false,
  isFavorite: () => false,
  toggleFavorite: async () => {},
  refreshFavorites: async () => {},
});

export const useFavorites = () => useContext(FavoritesContext);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useCurrentUser();
  const address = currentUser?.evmAccounts?.[0];
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFavorites = useCallback(async () => {
    if (!address) {
      setFavorites([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/favorites/${address}`);
      const data = await response.json();
      if (data.success) {
        setFavorites(data.favorites);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const isFavorite = useCallback((seriesId: string) => {
    return favorites.some(fav => fav.seriesId === seriesId);
  }, [favorites]);

  const toggleFavorite = useCallback(async (seriesId: string, seriesTitle: string, seriesCover: string) => {
    if (!address) return;

    const isCurrentlyFavorite = isFavorite(seriesId);

    try {
      if (isCurrentlyFavorite) {
        // Remove from favorites
        const response = await fetch(`${API_URL}/api/favorites/${address}/${seriesId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setFavorites(prev => prev.filter(fav => fav.seriesId !== seriesId));
        }
      } else {
        // Add to favorites
        const response = await fetch(`${API_URL}/api/favorites`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            address,
            seriesId,
            seriesTitle,
            seriesCover,
          }),
        });
        
        const data = await response.json();
        if (data.success) {
          setFavorites(prev => [...prev, data.favorite]);
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  }, [address, isFavorite]);

  const refreshFavorites = useCallback(async () => {
    await fetchFavorites();
  }, [fetchFavorites]);

  return (
    <FavoritesContext.Provider value={{ favorites, loading, isFavorite, toggleFavorite, refreshFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
}
