/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import { CHAIN_ID_OPTIONS, NETWORKS } from "../constants";
import { ethers } from "ethers";
import Image from "next/image";
import RetroLoading from "./RetroLoading";

interface CreateTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateTokenModal: React.FC<CreateTokenModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedNetwork, setSelectedNetwork] = useState(NETWORKS[0]);
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [chainIds, setChainIds] = useState<number[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [encodedLogo, setEncodedLogo] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionHash, setTransactionHash] = useState("");
  const [newTokenAddress, setNewTokenAddress] = useState("");
  const [isDone, setIsDone] = useState<boolean>(false);

  const [walletChainId, setWalletChainId] = useState<number | null>(null);

  useEffect(() => {
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

      if (walletChainId !== network.chainId) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: ethers.toQuantity(network.chainId) }],
          });
          setWalletChainId(network.chainId);
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: ethers.toQuantity(network.chainId),
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

  const handleLogoChange = (file: File | null) => {
    if (!file) {
      setLogo(null);
      setLogoPreview(null);
      setEncodedLogo(null);
      return;
    }

    if (!file.type.startsWith("image/jpeg")) {
      setError("Only JPG/JPEG images are allowed.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Image size must be less than 2MB.");
      return;
    }

    setError("");
    setLogo(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
      setEncodedLogo(reader.result?.toString().split(",")[1] || null);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    handleLogoChange(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleLogoChange(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
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

      const network = await provider.getNetwork();
      if (Number(network.chainId) !== selectedNetwork.chainId) {
        setError(`Please switch your wallet to ${selectedNetwork.name}`);
        setIsSubmitting(false);
        return;
      }

      const contractAddress = selectedNetwork.factoryContractAddress;
      const abi = [
        "function createPumpOutToken(string name, string symbol, uint256[] chainIds) payable returns (address)",
        "function getRequiredAmount(uint256[] chainIds) view returns (uint256)",
        "event PumpOutTokenCreated(address indexed tokenAddress, string name, string symbol, address minter, uint256 availableSupply, uint256 lpSupply, uint256 k, uint256 protocolFeePercentage, address protocolFeeCollector, uint256[] chainIds)",
      ];

      const contract = new ethers.Contract(contractAddress, abi, signer);

      console.log(
        "Fetching required amount from getRequiredAmount function..."
      );
      const requiredAmount = await contract.getRequiredAmount(chainIds);
      console.log(
        "Required amount for transaction:",
        requiredAmount.toString()
      );

      const tx = await contract.createPumpOutToken(name, symbol, chainIds, {
        value: requiredAmount,
      });
      setTransactionHash(tx.hash);

      const receipt = await tx.wait();
      console.log("Transaction receipt:", receipt);

      let newTokenAddress = "";
      if (receipt.events && Array.isArray(receipt.events)) {
        for (const event of receipt.events) {
          if (event.event === "PumpOutTokenCreated") {
            newTokenAddress = event.args?.tokenAddress;
            break;
          }
        }
      }

      if (!newTokenAddress && receipt.logs) {
        newTokenAddress = receipt.logs[0].address;
      }

      if (newTokenAddress) {
        setNewTokenAddress(newTokenAddress);
        console.log("New token address from event:", newTokenAddress);

        // Save token data to the database, including the base64-encoded logo
        await fetch("/api/tokens/addToken", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            network: selectedNetwork.chainId,
            tokenAddress: newTokenAddress,
            name,
            symbol,
            logo: encodedLogo ? `data:image/png;base64,${encodedLogo}` : null,
          }),
        });
      } else {
        setError("Failed to retrieve new token address from event or logs.");
      }

      setIsSubmitting(false);
      setIsDone(true);
    } catch (err: any) {
      console.error("Transaction error details:", err);
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

        {/* Logo Upload Area */}
        <div
          className="mt-4 border-dashed border-2 border-gray-300 p-4 rounded-md flex items-center justify-between"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {/* Left Side: Upload Button and Text */}
          <div className="flex flex-col space-y-2 w-1/2">
            <label className="block text-sm font-medium text-gray-700">
              Logo (JPG/JPEG, max 2MB)
            </label>
            <input
              type="file"
              accept=".jpg,.jpeg"
              onChange={handleFileInput}
              className="text-xs text-gray-500"
            />
            <p className="text-xs text-gray-500">
              Drag and drop an image here or click to select
            </p>
            {error && <div className="text-red-600 text-xs">{error}</div>}
          </div>

          {/* Right Side: Image Preview */}
          <div className="w-1/2 flex justify-center items-center">
            {logoPreview ? (
              <Image
                src={logoPreview}
                alt="Logo Preview"
                width={128}
                height={128}
                className="object-cover rounded-md"
              />
            ) : (
              <div className="w-32 h-32 bg-gray-200 flex items-center justify-center rounded-md">
                <span className="text-xs text-gray-400">No Image</span>
              </div>
            )}
          </div>
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
                    setChainIds(
                      e.target.checked
                        ? [...chainIds, value]
                        : chainIds.filter((id) => id !== value)
                    );
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

        {isSubmitting && <RetroLoading />}

        {/* Submit and Close Buttons */}
        <div className="mt-4 flex justify-between">
          <button
            type="button"
            disabled={isSubmitting || isDone}
            onClick={onClose}
            className={`${
              isSubmitting || isDone ? "bg-gray-400" : "bg-red-600"
            } text-white px-4 py-2 rounded`}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isDone}
            className={`${
              isSubmitting || isDone ? "bg-gray-400" : "bg-green-600"
            } text-white px-4 py-2 rounded`}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>

      {/* Transaction Result */}
      {transactionHash && isDone && (
        <div className="mt-4">
          <div className="mt-2">
            <button className="bg-green-600 text-white px-4 py-2 rounded-md font-semibold">
              <a
                href={`/tokens/${selectedNetwork.chainId}/${newTokenAddress}`}
                className="block"
              >
                Go to Token Page
              </a>
            </button>
            <a
              href={`${selectedNetwork.explorerUrl}/tx/${transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-1 text-xs text-blue-600 underline text-ellipsis overflow-hidden"
            >
              View Transaction
            </a>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default CreateTokenModal;
