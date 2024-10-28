import React from "react";

interface BridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  chainId: string;
  tokenAddress: string;
}

const BridgeModal: React.FC<BridgeModalProps> = ({ isOpen, onClose, chainId, tokenAddress }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-lg w-80">
        <h2 className="text-white text-lg mb-4">Bridge Options</h2>
        <p className="text-sm text-gray-400">Chain ID: {chainId}</p>
        <p className="text-sm text-gray-400">Token Address: {tokenAddress}</p>
        {/* Additional bridge details can be added here */}
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
