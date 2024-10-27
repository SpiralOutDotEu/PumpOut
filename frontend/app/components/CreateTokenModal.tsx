/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import { CHAIN_ID_OPTIONS, NETWORKS } from "../constants";
import { ethers } from "ethers";

interface CreateTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateTokenModal: React.FC<CreateTokenModalProps> = ({
  isOpen,
  onClose,
}) => {
  // State variables
  const [selectedNetwork, setSelectedNetwork] = useState(NETWORKS[0]);
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [chainIds, setChainIds] = useState<number[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [logo, setLogo] = useState<File | null>(null);

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionHash, setTransactionHash] = useState("");
  const [newTokenAddress, setNewTokenAddress] = useState("");

  const [walletChainId, setWalletChainId] = useState<number | null>(null);

  useEffect(() => {
    // Get the chainId from the wallet
    async function getChainId() {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const chainIdHex = await window.ethereum.request({
            method: "eth_chainId",
          });
          setWalletChainId(parseInt(chainIdHex, 16));
        } catch (error) {
          console.error(error);
        }
      }
    }
    getChainId();

    // Listen for chain changes
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("chainChanged", (chainId: string) => {
        setWalletChainId(parseInt(chainId, 16));
      });
    }
  }, []);

  const handleNetworkChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedChainId = parseInt(e.target.value, 10);
    const network = NETWORKS.find((n) => n.chainId === selectedChainId);
    if (network) {
      setSelectedNetwork(network);

      // Check if wallet is connected to the same network
      if (walletChainId !== network.chainId) {
        // Propose to switch network
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: ethers.toBeHex(network.chainId) }],
          });
          setWalletChainId(network.chainId);
        } catch (switchError: any) {
          // This error code indicates that the chain has not been added to MetaMask.
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: ethers.toBeHex(network.chainId),
                    chainName: network.name,
                    rpcUrls: [network.rpcUrl],
                  },
                ],
              });
            } catch (addError) {
              console.error(addError);
            }
          } else {
            console.error(switchError);
          }
        }
      }
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Leave empty function for now
    // TODO: handle image
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (!window.ethereum) {
        setError("Please install MetaMask!");
        setIsSubmitting(false);
        return;
      }

      if (chainIds.length === 0) {
        setError("Please select at least one chain.");
        setIsSubmitting(false);
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Ensure connected network matches selected network
      const network = await provider.getNetwork();
      if (Number(network.chainId) !== selectedNetwork.chainId) {
        setError(`Please switch your wallet to ${selectedNetwork.name}`);
        setIsSubmitting(false);
        return;
      }

      // Get contract
      const contractAddress = selectedNetwork.factoryContractAddress;
      const abi = [
        // Minimal ABI with the createPumpOutToken function and the PumpOutTokenCreated event
        "function createPumpOutToken(string name, string symbol, uint256[] chainIds) payable returns (address)",
        "event PumpOutTokenCreated(address indexed tokenAddress, string name, string symbol, uint256[] chainIds)",
      ];

      const contract = new ethers.Contract(contractAddress, abi, signer);

      // Calculate requiredAmount
      const requiredAmount = ethers.parseEther("0"); // Adjust if needed based on getRequiredAmount function

      const tx = await contract.createPumpOutToken(name, symbol, chainIds, {
        value: requiredAmount,
      });
      setTransactionHash(tx.hash);

      // Wait for transaction to be mined
      const receipt = await tx.wait();

      // Get the event from the receipt
      let newTokenAddress = "";
      for (const event of receipt.events) {
        if (event.event === "PumpOutTokenCreated") {
          newTokenAddress = event.args?.tokenAddress;
          setNewTokenAddress(newTokenAddress);
          break;
        }
      }

      if (!newTokenAddress) {
        setError("Failed to retrieve new token address from event.");
      }

      setIsSubmitting(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred.");
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create a Token">
      <form onSubmit={handleSubmit}>
        {/* Network Selection */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            Select Network for Bonding & Governance
          </label>
          <select
            value={selectedNetwork.chainId}
            onChange={handleNetworkChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            {NETWORKS.map((network) => (
              <option
                key={network.chainId}
                value={network.chainId}
                disabled={!network.supported}
              >
                {network.name} {network.supported ? "" : "(Coming Soon)"}
              </option>
            ))}
          </select>
        </div>

        {/* Logo Upload */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            Logo
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            className="mt-1 block w-full text-sm text-gray-500"
          />
        </div>

        {/* Function Parameters */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            Symbol
          </label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>

        {/* Chain IDs Selection */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            Select additional Chains to be native
          </label>
          <div className="mt-2">
            {CHAIN_ID_OPTIONS.filter(
              (option) => option.chainId !== selectedNetwork.chainId
            ).map((option) => (
              <div key={option.chainId} className="flex items-center">
                <input
                  type="checkbox"
                  id={`chain-${option.chainId}`}
                  value={option.chainId}
                  checked={chainIds.includes(option.chainId)}
                  disabled={!option.supported}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (e.target.checked) {
                      setChainIds([...chainIds, value]);
                    } else {
                      setChainIds(chainIds.filter((id) => id !== value));
                    }
                  }}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
                <label
                  htmlFor={`chain-${option.chainId}`}
                  className={`ml-2 block text-sm ${
                    option.supported ? "text-gray-700" : "text-gray-400"
                  }`}
                >
                  {option.name} {option.supported ? "" : "(Coming Soon)"}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && <div className="mt-4 text-red-600">{error}</div>}

        {/* Submit Button */}
        <div className="mt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>

      {/* Transaction Link */}
      {transactionHash && (
        <div className="mt-4">
          <p>Transaction submitted:</p>
          <a
            href={`${selectedNetwork.explorerUrl}/tx/${transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            View Transaction
          </a>
        </div>
      )}

      {/* New Token Address */}
      {newTokenAddress && (
        <div className="mt-4">
          <p>New Token Address:</p>
          <a
            href={`${selectedNetwork.explorerUrl}/address/${newTokenAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            {newTokenAddress}
          </a>
          <div className="mt-2">
            <a
              href={`/tokens/${selectedNetwork.chainId}/${newTokenAddress}`}
              className="text-blue-600 underline"
            >
              Go to Token Page
            </a>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default CreateTokenModal;
