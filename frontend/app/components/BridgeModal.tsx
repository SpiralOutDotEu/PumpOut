"use client";
import React from "react";
import type { WormholeConnectConfig } from "@wormhole-foundation/wormhole-connect";
import WormholeConnect from "@wormhole-foundation/wormhole-connect";

interface BridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  chainId: string;
  tokenAddress: string;
  wormholeConfig: WormholeConnectConfig | null;
}

const BridgeModal: React.FC<BridgeModalProps> = ({
  isOpen,
  onClose,
  chainId,
  tokenAddress,
  wormholeConfig,
}) => {
  if (!isOpen) return null;

  const myWormholeConfig: WormholeConnectConfig =
    wormholeConfig as WormholeConnectConfig;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-lg w-[640px]">
        <h2 className="text-white text-lg mb-4">Bridge Options</h2>
        <p className="text-sm text-gray-400">Chain ID: {chainId}</p>
        <p className="text-sm text-gray-400">Token Address: {tokenAddress}</p>

        <div className="mt-4">
          <WormholeConnect config={myWormholeConfig} />
        </div>

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
