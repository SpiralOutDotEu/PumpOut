// components/Header.tsx
"use client";

import React, { useState } from "react";
import Modal from "./Modal";

const Header: React.FC = () => {
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isCreateTokenOpen, setIsCreateTokenOpen] = useState(false);

  return (
    <header className="flex items-center justify-between p-4 bg-gray-900">
      {/* Left: Brand Name */}
      <div className="text-2xl font-bold">PUMPOUT</div>

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
      <div>
        <button className="bg-green-600 px-4 py-2 rounded">
          Connect Wallet
        </button>
      </div>

      {/* Modals */}
      {isHowItWorksOpen && (
        <Modal
          isOpen={isHowItWorksOpen}
          onClose={() => setIsHowItWorksOpen(false)}
          title="How It Works"
        >
          <p>Explanation goes here...</p>
        </Modal>
      )}

      {isCreateTokenOpen && (
        <Modal
          isOpen={isCreateTokenOpen}
          onClose={() => setIsCreateTokenOpen(false)}
          title="Create a Token"
        >
          <p>Form goes here...</p>
        </Modal>
      )}
    </header>
  );
};

export default Header;
