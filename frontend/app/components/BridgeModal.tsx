"use client";
import React, { useEffect, useState } from "react";
import type { WormholeConnectConfig } from "@wormhole-foundation/wormhole-connect";
import WormholeConnect from "@wormhole-foundation/wormhole-connect";

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
      <div className="bg-gray-800 p-6 rounded-lg w-[860px] max-h-[90vh] overflow-y-auto">
        <h2 className="text-white text-lg mb-4">Bridge Options</h2>
        <p className="text-sm text-gray-400">Chain ID: {chainId}</p>
        <p className="text-sm text-gray-400">Token Address: {tokenAddress}</p>

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
