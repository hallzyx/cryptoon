import type { Metadata } from "next";
// @ts-ignore
import "./globals.css";
import { Providers } from "./providers";
import { BalanceProvider } from "./contexts/BalanceContext";
import AIRecommendationChat from "./components/AIRecommendationChat";

export const metadata: Metadata = {
  title: "Cryptoon - NFT Memes",
  description: "Create and collect NFT memes",
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
            {children}
            <AIRecommendationChat />
          </BalanceProvider>
        </Providers>
      </body>
    </html>
  );
}
