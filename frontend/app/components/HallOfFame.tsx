"use client";

import React, { useState, useEffect } from "react";

// Token type for hall of fame
interface HallOfFameToken {
  id: number;
  name: string;
}

// Hall of Fame component
const HallOfFame: React.FC = () => {
  const [tokens, setTokens] = useState<HallOfFameToken[]>([]);

  // Fetch latest token for Hall of Fame
  useEffect(() => {
    const fetchLatestWinner = async () => {
      try {
        const res = await fetch("/api/halloffame");
        if (!res.ok) throw new Error("Failed to fetch token");
        const newToken: HallOfFameToken = await res.json();

        // Add the new token and keep the last three
        setTokens((prevTokens) => [newToken, ...prevTokens.slice(0, 2)]);
      } catch (error) {
        console.error("Error fetching Hall of Fame token:", error);
      }
    };

    // Initial fetch
    fetchLatestWinner();

    // Poll every 20 seconds
    const interval = setInterval(fetchLatestWinner, 20000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex justify-center items-center">
      <div className="border-4 border-white p-4 rounded-lg inline-block">
        <h2 className="text-xl font-bold mb-4 text-center">Hall of Fame</h2>
        <div className="flex flex-col items-center space-y-4">
          {/* Latest token, prominently displayed */}
          {tokens[0] && (
            <div
              className="w-64 h-32 flex flex-col items-center justify-center bg-yellow-400 text-black font-semibold text-md rounded-lg shadow-lg border border-black"
              title={tokens[0].name}
            >
              {/* Placeholder for token icon */}
              <div className="w-10 h-10 bg-gray-300 rounded-full mb-2" />
              <span>{tokens[0].name}</span>
              <span className="text-sm">Winner!</span>
            </div>
          )}

          {/* Two smaller tokens below the latest */}
          <div className="flex space-x-4">
            {tokens.slice(1).map((token) => (
              <div
                key={token.id}
                className="w-40 h-20 flex flex-col items-center justify-center bg-blue-500 text-white font-semibold text-sm rounded-lg shadow-md border border-black"
                title={token.name}
              >
                {/* Placeholder for token icon */}
                <div className="w-8 h-8 bg-gray-300 rounded-full mb-1" />
                <span>{token.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HallOfFame;
