"use client";

import React, { useState } from "react";
import Modal from "./Modal";
import CreateTokenModal from "./CreateTokenModal";
import { useWallet } from "../context/WalletProvider";
import { useRouter } from "next/navigation";
import HowItWorksModal from "./HowItWorksModal";

const Header: React.FC = () => {
  const router = useRouter();
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isCreateTokenOpen, setIsCreateTokenOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for dropdown menu
  const {
    account,
    connectWallet,
    disconnectWallet,
    isMetaMaskError,
    setMetaMaskError,
  } = useWallet();

  const handleConnectWallet = async () => {
    if (!account) {
      await connectWallet();
    } else {
      setIsDropdownOpen(!isDropdownOpen); // Toggle dropdown if already connected
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleCopyAddress = async () => {
    if (account) {
      await navigator.clipboard.writeText(account);
      alert("Address copied to clipboard!");
    }
    setIsDropdownOpen(false); // Close dropdown after copying
  };

  return (
    <header className="flex items-center justify-between p-4 bg-gray-900 relative shadow-2xl">
      {/* Left: Brand Name (Clickable to go Home) */}
      <button className="text-2xl font-bold" onClick={() => router.push("/")}>
        PUMPOUT
      </button>

      {/* Middle: Links */}
      <div className="space-x-4">
        <button
          className="modal-button"
          onClick={() => setIsHowItWorksOpen(true)}
        >
          How It Works
        </button>
        <button
          className="modal-button"
          onClick={() => setIsCreateTokenOpen(true)}
        >
          Create a Token
        </button>
      </div>

      {/* Right: Connect Wallet */}
      <div className="relative">
        <button
          onClick={handleConnectWallet}
          className="bg-green-600 px-4 py-2 rounded"
        >
          {account ? formatAddress(account) : "Connect Wallet"}
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && account && (
          <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-md shadow-lg z-10">
            <ul className="py-1">
              <li
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => alert("Go to Profile")}
              >
                Profile
              </li>
              <li
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={handleCopyAddress}
              >
                Copy address
              </li>
              <li
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-500"
                onClick={() => {
                  disconnectWallet();
                  setIsDropdownOpen(false); // Close dropdown after disconnecting
                }}
              >
                Disconnect
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Modals */}
      {isHowItWorksOpen && (
        <HowItWorksModal
          isOpen={isHowItWorksOpen}
          onClose={() => setIsHowItWorksOpen(false)}
        />
      )}

      {isCreateTokenOpen && (
        <CreateTokenModal
          isOpen={isCreateTokenOpen}
          onClose={() => setIsCreateTokenOpen(false)}
        />
      )}

      {/* MetaMask Error Modal */}
      {isMetaMaskError && (
        <Modal
          isOpen={isMetaMaskError}
          onClose={() => setMetaMaskError(false)}
          title="Ethereum Wallet Not Found"
        >
          <p className="mt-4">
            Please install MetaMask, or another Ethereum wallet, to connect.
          </p>

          {/* Close Button at the Bottom */}
          <div className="mt-6 flex justify-end">
            <button
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              onClick={() => setMetaMaskError(false)}
            >
              Close
            </button>
          </div>
        </Modal>
      )}
    </header>
  );
};

export default Header;
