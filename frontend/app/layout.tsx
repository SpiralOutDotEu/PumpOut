import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "./context/WalletProvider";
import Header from "./components/Header";
import BetaBanner from "./components/BetaBanner";

const pressStart2P = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-press-start-2p",
});

export const metadata: Metadata = {
  title: "Pumpout",
  description: "Retro-styled, cross-chain meme token creator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${pressStart2P.variable} antialiased`}>
        <WalletProvider>
          <BetaBanner />
          <Header />
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
