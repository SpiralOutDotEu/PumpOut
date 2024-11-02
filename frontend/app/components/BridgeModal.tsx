"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { WormholeConnectConfig } from "@wormhole-foundation/wormhole-connect";
import Loading from "./RetroLoading"; // Import the Loading component

// Dynamically import WormholeConnect with no SSR
const WormholeConnect = dynamic(
  () => import("@wormhole-foundation/wormhole-connect"),
  { ssr: false, loading: () => <Loading /> } // Add Loading component during import
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWormholeConfig = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/tokens/getTokenByAddress?network=${chainId}&tokenAddress=${tokenAddress}`
        );
        if (response.ok) {
          const tokenData = await response.json();
          const config =
            typeof tokenData.wormholeConnectConfig === "string"
              ? JSON.parse(tokenData.wormholeConnectConfig)
              : tokenData.wormholeConnectConfig;
          setWormholeConfig(config);
          console.log("Wormhole Connect Config:", config);
        } else {
          console.error("Failed to fetch wormhole connect config");
        }
      } catch (error) {
        console.error("Error fetching wormhole connect config:", error);
      } finally {
        setIsLoading(false);
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

        {/* Loading Spinner */}
        {isLoading ? (
          <Loading />
        ) : wormholeConfig ? (
          // Render WormholeConnect if config is available
          <div className="mt-4">
            <WormholeConnect config={wormholeConfig} />
          </div>
        ) : (
          // Message if config is not available
          <div className="mt-4 text-sm text-gray-500">
            <p className="mb-2">
              It seems that the Wormhole config is not available yet. If this is
              a new token, please check back in 10-15 minutes. Configurations
              may take some time to become available.
            </p>
            <p className="mb-2"> Note that this is still in Proof Of Concept Stage and without much of error handling.</p>
            <p>
              If you just want to see how this works, try a ready token here:{" "}
              <a
                href="https://demo.pumpout.xyz/tokens/84532/0x9aEd9e8c3526D05462816ADB54020B803400FB82"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline"
              >
                Ready Token Example
              </a>
              . You can mint some tokens on Base Sepolia and then bridge them to
              Arbitrum Sepolia or Solana.
            </p>
          </div>
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
