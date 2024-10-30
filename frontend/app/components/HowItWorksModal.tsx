"use client";

import React from "react";
import { Dialog, DialogPanel } from "@headlessui/react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HowItWorksModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50 font-retro"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-900 opacity-80"
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="mx-auto max-w-4xl rounded-lg bg-gray-800 p-10 text-gray-100 shadow-2xl border-4 border-gray-700">
          {/* Title */}
          <div className="text-center font-bold text-2xl mb-4 text-yellow-400">
            How Pump Out Works
          </div>

          {/* Cult Message */}
          <div className="text-center font-bold text-lg text-blue-400 mb-4">
            Build or Join your cult with Pump Out!
          </div>

          {/* How Pump Works Section */}
          <div className="mb-4">
            <h3 className="font-semibold text-yellow-300 mb-4">
              How Pump Works:
            </h3>
            <ul className="list-decimal pl-5 space-y-2 text-sm text-gray-300">
              <li>Select a token that fits your vibe.</li>
              <li>Purchase on the bonding curve.</li>
              <li>Sell anytime to lock in gains or cut losses.</li>
              <li>Once enough buy-ins raise market cap to $69k:</li>
              <ul>
                <li className="mb-2">
                  a. $12k liquidity goes to Uniswap and is burned.
                </li>
                <li>
                  b. A DAO is formed, governed by token holders and with 100
                  million tokens to it&apos;s treasury to start your cult.
                </li>
              </ul>
            </ul>
          </div>

          {/* Pump Out Advantages Section */}
          <div>
            <h3 className="font-semibold text-yellow-300 mb-4 mt-8">
              Why Pump Out Stands Out:
            </h3>
            <ul className="space-y-4 text-sm text-gray-300">
              <li className="flex flex-col space-y-2">
                <span className="font-bold text-blue-300">
                  Rug-Free and Fair Launch
                </span>
                <span>
                  Every Pump Out token is designed to be fair and safe – no
                  presales, no hidden allocations. Just a transparent, equal
                  start for everyone.
                </span>
              </li>
              <li className="flex flex-col space-y-2">
                <span className="font-bold text-blue-300">
                  Cross-Chain Compatibility
                </span>
                <span>
                  Pump Out tokens are built for cross-chain compatibility,
                  allowing seamless transfers across multiple networks.
                </span>
              </li>
              <li className="flex flex-col space-y-2">
                <span className="font-bold text-blue-300">
                  Liquidity & DAO Formation
                </span>
                <span>
                  When the target market cap is reached, liquidity is deposited
                  into Uniswap and burned to ensure stability. Additionally, a
                  DAO is formed, with 100 million tokens sent to holders,
                  empowering the community.
                </span>
              </li>
              <li className="flex flex-col space-y-2">
                <span className="font-bold text-blue-300">
                  Cult-Oriented Vibe
                </span>
                <span>
                  Join or build your cult – Pump Out embraces a community-driven
                  approach with a vibe that encourages users to become part of
                  something unique.
                </span>
              </li>
            </ul>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-bold tracking-widest"
          >
            Close
          </button>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default HowItWorksModal;
