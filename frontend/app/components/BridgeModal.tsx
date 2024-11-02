"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic"; // Import Next.js dynamic
import type { WormholeConnectConfig } from "@wormhole-foundation/wormhole-connect";

// Dynamically import WormholeConnect with no SSR
const WormholeConnect = dynamic(
  () => import("@wormhole-foundation/wormhole-connect"),
  { ssr: false }
);

interface BridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  chainId: string;
  tokenAddress: string;
}

const BridgeModal: React.FC<BridgeModalProps> = ({
  isOpen,
  onClose,
  chainId,
  tokenAddress,
}) => {
  const [wormholeConfig, setWormholeConfig] =
    useState<WormholeConnectConfig | null>(null);

  useEffect(() => {
    const fetchWormholeConfig = async () => {
      try {
        const response = await fetch(
          `/api/tokens/getTokenByAddress?network=${chainId}&tokenAddress=${tokenAddress}`
        );
        if (response.ok) {
          const tokenData = await response.json();
          const config =
            typeof tokenData.wormholeConnectConfig === "string"
              ? JSON.parse(tokenData.wormholeConnectConfig)
              : tokenData.wormholeConnectConfig;
          setWormholeConfig(config); // Set the parsed config
          console.log("Wormhole Connect Config:", config);
        } else {
          console.error("Failed to fetch wormhole connect config");
        }
      } catch (error) {
        console.error("Error fetching wormhole connect config:", error);
      }
    };

    if (isOpen) {
      fetchWormholeConfig();
    }
  }, [isOpen, chainId, tokenAddress]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-scroll">
      <div className="relative bg-gray-800 p-6 rounded-lg w-[860px] max-h-[90vh] overflow-y-auto">
        {/* Close button in the top-right corner */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-lg"
          aria-label="Close"
        >
          X
        </button>

        {/* Centered title */}
        <h2 className="text-white text-xl mb-4 flex items-center justify-center">
          Bridge Your Assets
        </h2>

        {/* Render WormholeConnect if wormholeConfig is available */}
        {wormholeConfig ? (
          <div className="mt-4">
            <WormholeConnect config={wormholeConfig} />
          </div>
        ) : (
          <p className="text-sm text-gray-500 mt-4">
            Loading bridge options...
          </p>
        )}

        {/* Close button at the bottom */}
        <button
          onClick={onClose}
          className="bg-red-500 text-white py-2 px-4 rounded-md w-full mt-4"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default BridgeModal;
