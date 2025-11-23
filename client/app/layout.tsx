import type { Metadata } from "next";
// @ts-ignore
import "./globals.css";
import { Providers } from "./providers";
import { BalanceProvider } from "./contexts/BalanceContext";
import { FavoritesProvider } from "./contexts/FavoritesContext";
import AIRecommendationChat from "./components/AIRecommendationChat";

export const metadata: Metadata = {
  title: "Cryptoon - Crypto-manga site",
  description: "Help to your artist with crypto!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans">
        <Providers>
          <BalanceProvider>
            <FavoritesProvider>
              {children}
              <AIRecommendationChat />
            </FavoritesProvider>
          </BalanceProvider>
        </Providers>
      </body>
    </html>
  );
}
