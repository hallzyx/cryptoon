"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useCurrentUser } from "@coinbase/cdp-hooks";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface BalanceContextType {
  balance: string;
  loading: boolean;
  refreshBalance: () => Promise<void>;
}

const BalanceContext = createContext<BalanceContextType>({
  balance: "0",
  loading: false,
  refreshBalance: async () => {},
});

export const useBalance = () => useContext(BalanceContext);

export function BalanceProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useCurrentUser();
  const address = currentUser?.evmAccounts?.[0];
  const [balance, setBalance] = useState<string>("0");
  const [loading, setLoading] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!address) {
      setBalance("0");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/balance/${address}`);
      const data = await response.json();
      if (data.balance !== undefined) {
        setBalance(data.balance);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setLoading(false);
    }
  }, [address]);

  // Fetch balance when address changes
  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const refreshBalance = useCallback(async () => {
    await fetchBalance();
  }, [fetchBalance]);

  return (
    <BalanceContext.Provider value={{ balance, loading, refreshBalance }}>
      {children}
    </BalanceContext.Provider>
  );
}
