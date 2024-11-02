"use client";

import React, { useState, useEffect } from "react";
import { Token } from "../types/token";

// Token type now includes color
interface ColoredToken extends Token {
  color: string;
}

// Helper function to determine text color for better contrast
const getContrastColor = (hexColor: string) => {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  // Ensure that very dark backgrounds always get white text
  if (brightness < 50) {
    return "#FFFFFF"; // Use white text for very dark backgrounds
  }

  // Ensure that very light backgrounds always get black text
  if (brightness > 200) {
    return "#000000"; // Use black text for very light backgrounds
  }

  // Default to black for light backgrounds and white for dark backgrounds
  return brightness > 155 ? "#000000" : "#FFFFFF";
};

const Hero: React.FC = () => {
  const [tokens, setTokens] = useState<ColoredToken[]>([]);

  useEffect(() => {
    const fetchLatestActions = async () => {
      try {
        const res = await fetch("/api/latest");
        if (!res.ok) throw new Error("Failed to fetch token");
        const newToken: Token = await res.json();

        // Assign a color to the new token
        const newColoredToken: ColoredToken = {
          ...newToken,
          color:
            "#" +
            Math.floor(Math.random() * 16777215)
              .toString(16)
              .padStart(6, "0"), // Ensure valid hex
        };

        // Add the new token and maintain colors of old ones
        setTokens((prevTokens) => [
          newColoredToken,
          ...prevTokens.slice(0, 64),
        ]);
      } catch (error) {
        console.error("Error fetching token:", error);
      }
    };

    // Fetch data initially
    fetchLatestActions();

    // Polling every 5 seconds
    const interval = setInterval(fetchLatestActions, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 flex justify-center">
      <div className="flex flex-wrap gap-x-2 gap-y-2 justify-center">
        {tokens.map((token) => {
          const textColor = getContrastColor(token.color);

          return (
            <div
              key={token.id}
              className="h-10 w-60 flex items-center justify-center rounded-sm overflow-hidden text-[8px] font-semibold shadow-md border border-white"
              style={{
                backgroundColor: token.color,
                color: textColor,
              }}
              title={token.name}
            >
              <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                {token.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Hero;
