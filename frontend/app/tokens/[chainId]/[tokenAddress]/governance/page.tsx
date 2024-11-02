"use client";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ChatBubbleLeftEllipsisIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

const GovernancePage: React.FC = () => {
  const pathname = usePathname();

  // Extract chainId and tokenAddress from the URL path
  const pathSegments = pathname.split("/");
  const chainId = pathSegments[2];
  const tokenAddress = pathSegments[3];

  // State for token data
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [logo, setLogo] = useState("");

  // Construct the link to go back to the trade page
  const tradeLink = `/tokens/${chainId}/${tokenAddress}`;

  // Mocked voting data for the current proposal
  const yesVotes = "452.348.631"; // Mocked Yes votes
  const noVotes = "207.651.369"; // Mocked No votes
  const quorumPercentage = 60; // Mocked quorum percentage
  const quorumMet = quorumPercentage >= 50; // Check if quorum is met

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
          setLogo(tokenData.logo);
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

  // Calculate voting power percentage
  const userBalance = 10000; // Mocked user balance
  const totalSupply = 1.1e9; // 1.1 billion total supply
  const votingPowerPercentage = ((userBalance / totalSupply) * 100).toFixed(4);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Left Side (Governance Panels) */}
      <div className="flex flex-col w-full md:w-3/4 p-4 space-y-4">
        {/* Active Proposals Panel */}
        <div className="bg-gray-700 p-4 rounded-md space-y-4">
          <p className="text-lg font-bold">Active Proposals</p>
          <div className="bg-gray-600 p-4 rounded-md">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-bold text-yellow-300">
                  Spend 100,000 tokens for a twitter marketing event series
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Voting ends in: 3 days 12 hours
                </p>
              </div>
              <div className="flex items-center text-gray-400">
                <ChatBubbleLeftEllipsisIcon className="h-4 w-4 mr-1" />
                <span className="text-xs">12 comments</span>
              </div>
            </div>
            <p className="text-xs text-gray-300 mt-3">
              This proposal aims to allocate 100,000 tokens for a series of
              twitter marketing event to promote our meme token on various
              platforms. The goal is to increase awareness and attract more
              users. Tokens will be distributed among the most active twitter
              posters.
            </p>

            {/* Status Section */}
            <div className="mt-4">
              <p className="text-sm font-bold">Current Status:</p>
              <div className="text-xs text-gray-400 mt-1">
                <p>
                  Yes Votes: {yesVotes.toLocaleString()} {tokenSymbol}
                </p>
                <p>
                  No Votes: {noVotes.toLocaleString()} {tokenSymbol}
                </p>
                <p
                  className={`font-bold ${
                    quorumMet ? "text-green-400" : "text-red-400"
                  }`}
                >
                  Quorum: {quorumPercentage}%{" "}
                  {quorumMet ? "(Met)" : "(Not Met)"}
                </p>
              </div>
            </div>

            <button className="mt-3 bg-blue-500 text-white py-1 px-4 rounded-md">
              Vote Now
            </button>
          </div>
        </div>

        {/* Previous Proposals Panel */}
        <div className="bg-gray-700 p-4 rounded-md space-y-4">
          <p className="text-lg font-bold">Previous Proposals</p>
          <ul className="mt-2 text-sm space-y-1">
            <li className="bg-gray-600 p-2 rounded-md flex justify-between items-center">
              <div>
                <p className="font-bold text-green-400">
                  Proposal: Fund meme competition
                </p>
                <p className="text-xs text-gray-400">
                  Result: <span className="text-green-400">Passed</span> (85%
                  Yes / 15% No)
                </p>
              </div>
              <div className="flex items-center text-gray-400">
                <ChatBubbleLeftEllipsisIcon className="h-4 w-4 mr-1" />
                <span className="text-xs">8 comments</span>
              </div>
            </li>
            <li className="bg-gray-600 p-2 rounded-md flex justify-between items-center">
              <div>
                <p className="font-bold text-red-400">
                  Proposal: Launch meme merchandise
                </p>
                <p className="text-xs text-gray-400">
                  Result: <span className="text-red-400">Rejected</span> (45%
                  Yes / 55% No)
                </p>
              </div>
              <div className="flex items-center text-gray-400">
                <ChatBubbleLeftEllipsisIcon className="h-4 w-4 mr-1" />
                <span className="text-xs">5 comments</span>
              </div>
            </li>
            <li className="bg-gray-600 p-2 rounded-md flex justify-between items-center">
              <div>
                <p className="font-bold text-green-400">
                  Proposal: Airdrop tokens to top meme creators
                </p>
                <p className="text-xs text-gray-400">
                  Result: <span className="text-green-400">Passed</span> (70%
                  Yes / 30% No)
                </p>
              </div>
              <div className="flex items-center text-gray-400">
                <ChatBubbleLeftEllipsisIcon className="h-4 w-4 mr-1" />
                <span className="text-xs">15 comments</span>
              </div>
            </li>
            <li className="bg-gray-600 p-2 rounded-md flex justify-between items-center">
              <div>
                <p className="font-bold text-green-400">
                  Proposal: Bridge & kickstart liquidity pool on Raydium -
                  Solana
                </p>
                <p className="text-xs text-gray-400">
                  Result: <span className="text-green-400">Passed</span> (83%
                  Yes / 17% No)
                </p>
              </div>
              <div className="flex items-center text-gray-400">
                <ChatBubbleLeftEllipsisIcon className="h-4 w-4 mr-1" />
                <span className="text-xs">20 comments</span>
              </div>
            </li>
          </ul>
        </div>

        {/* Start a Proposal Panel */}
        <div className="bg-gray-700 p-4 rounded-md">
          <p className="text-lg font-bold">Start a Proposal</p>
          <form className="mt-2">
            <input
              type="text"
              placeholder="Proposal Title"
              className="w-full p-2 mb-2 bg-gray-800 text-white rounded-md"
            />
            <textarea
              placeholder="Proposal Description"
              className="w-full p-2 mb-2 bg-gray-800 text-white rounded-md"
              rows={3}
            />
            <input
              type="number"
              placeholder="Amount of Tokens to Spend"
              className="w-full p-2 mb-2 bg-gray-800 text-white rounded-md"
            />
            <input
              type="text"
              placeholder="Recipient Address"
              className="w-full p-2 mb-2 bg-gray-800 text-white rounded-md"
            />
            <button
              type="button"
              className="bg-blue-500 text-white py-2 px-4 rounded-md mb-2"
            >
              Add Action
            </button>
            <button
              type="submit"
              className="bg-green-500 text-white py-2 px-4 rounded-md"
            >
              Submit Proposal
            </button>
          </form>
        </div>
      </div>

      {/* Right Side (Token Details and Treasury) */}
      <div className="w-full md:w-1/4 p-4 bg-gray-800">
         {/* Token Logo and Details */}
         <div className="bg-gray-700 p-4 mb-4 rounded-md">
          <div className="flex items-center space-x-4">
            {/* Token Logo Placeholder */}
            {/* Token Logo Display */}
            <div className="w-32 h-32 bg-gray-600 rounded-full flex items-center justify-center overflow-hidden">
              {logo ? (
                <img
                  src={logo}
                  alt="Token Logo"
                  className="object-cover w-full h-full"
                />
              ) : (
                <p className="text-sm font-bold">Logo</p>
              )}
            </div>
            <div>
              {/* Token Name and Symbol */}
              <p className="text-lg font-bold">{tokenName || "Token Name"}</p>
              <p className="text-sm text-gray-400">{tokenSymbol || "Symbol"}</p>
              <p className="text-xs text-gray-500">
                Address: {shortenedAddress}
              </p>
              <p className="text-xs text-gray-500">Chain ID: {chainId}</p>
              {/* Button to go back to Trade */}
              <Link href={tradeLink}>
                <button className="w-full bg-green-300 text-black font-semibold py-1 px-3 rounded-md hover:bg-green-500 transition text-xs mt-2">
                  Go to Trade
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Mock-Up Warning Panel */}
        <div className="text-red-500 text-center text-xs mb-4">
          <p>This is a mock-up for demonstration purposes only.</p>
        </div>

        {/* Treasury Panel */}
        <div className="bg-gray-700 p-4 mb-4 rounded-md">
          <p className="text-lg font-bold">Treasury</p>
          <p className="text-sm mt-2">89,125,000 {tokenSymbol}</p>
        </div>

        {/* Balance and Voting Power Panel */}
        <div className="bg-gray-700 p-4 rounded-md">
          <p className="text-lg font-bold">Your Balance & Voting Power</p>
          <p className="text-sm mt-2">Balance: 10,000 {tokenSymbol}</p>
          <p className="text-sm">
            Voting Power: 10,000 votes ({votingPowerPercentage}%)
          </p>
        </div>
      </div>
    </div>
  );
};

export default GovernancePage;
