"use client";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import TradePanel from "@/app/components/TradePanel";

const TokenPage: React.FC = () => {
  const pathname = usePathname();

  // Extract chainId and tokenAddress from the URL path
  const pathSegments = pathname.split("/");
  const chainId = pathSegments[2];
  const tokenAddress = pathSegments[3];

  // State for token data
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");

  // Fetch token data from the API
  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        const response = await fetch(
          `/api/tokens/getTokenByAddress?network=${chainId}&tokenAddress=${tokenAddress}`
        );
        if (response.ok) {
          const tokenData = await response.json();
          setTokenName(tokenData.name);
          setTokenSymbol(tokenData.symbol);
        } else {
          console.error("Failed to fetch token data");
        }
      } catch (error) {
        console.error("Error fetching token data:", error);
      }
    };

    fetchTokenData();
  }, [chainId, tokenAddress]);

  // Shorten the token address for display
  const shortenedAddress = `${tokenAddress.slice(0, 6)}...${tokenAddress.slice(
    -4
  )}`;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Left Side (Trade Graph and Trades/Chat) */}
      <div className="flex flex-col w-full md:w-3/4 p-4 space-y-4">
        {/* Trade Graph */}
        <div className="flex-grow bg-black text-center flex items-center justify-center">
          <p className="text-xl font-bold">Placeholder for trade graph</p>
        </div>

        {/* Trades and Chat */}
        <div className="flex-grow bg-black text-center flex items-center justify-center">
          <p className="text-xl font-bold">Placeholder for trades and chat</p>
        </div>
      </div>

      {/* Right Side (Token Details and Bonding Curve Data) */}
      <div className="w-full md:w-1/4 p-4 bg-gray-800">
        {/* Token Logo and Details */}
        <div className="bg-gray-700 p-4 mb-4 rounded-md">
          <div className="flex items-center space-x-4">
            {/* Token Logo Placeholder */}
            <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
              <p className="text-sm font-bold">Logo</p>
            </div>
            <div>
              {/* Token Name and Symbol */}
              <p className="text-lg font-bold">{tokenName || "Token Name"}</p>
              <p className="text-sm text-gray-400">{tokenSymbol || "Symbol"}</p>
              <p className="text-xs text-gray-500">
                Address: {shortenedAddress}
              </p>
              <p className="text-xs text-gray-500">Chain ID: {chainId}</p>
            </div>
          </div>
        </div>
        <TradePanel network={chainId} tokenAddress={tokenAddress} />
        {/* Bonding Curve Data */}
        <div className="bg-gray-700 p-4 rounded-md">
          <p className="text-lg font-bold">Bonding Curve Data</p>
          {/* Placeholder Data */}
          <ul className="mt-2 text-sm">
            <li>Available Supply: 1,000,000</li>
            <li>LP Supply: 500,000</li>
            <li>Protocol Fee: 0.5%</li>
            {/* Add other bonding curve data as needed */}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TokenPage;
