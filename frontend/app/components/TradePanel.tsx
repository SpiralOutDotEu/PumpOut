"use client";

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWallet } from "../context/WalletProvider"; // Import useWallet hook
import PumpOutTokenABI from "../../../contracts/out/PumpOutToken.sol/PumpOutToken.json";
import BridgeModal from "./BridgeModal";

interface TradePanelProps {
  network: string;
  tokenAddress: string;
}

const TradePanel: React.FC<TradePanelProps> = ({ network, tokenAddress }) => {
  const { account, provider, isMetaMaskError } = useWallet();
  const [tab, setTab] = useState("buy");
  const [ethAmount, setEthAmount] = useState(0);
  const [tokenAmount, setTokenAmount] = useState(0);
  const [estimatedTokens, setEstimatedTokens] = useState(0);
  const [estimatedEth, setEstimatedEth] = useState(0);
  const [slippage, setSlippage] = useState(1);
  const [isBridgeModalOpen, setIsBridgeModalOpen] = useState(false);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [ethBalance, setEthBalance] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Create contract instance using the wallet provider
  const contract = provider
    ? new ethers.Contract(tokenAddress, PumpOutTokenABI.abi, provider)
    : null;

  useEffect(() => {
    if (!provider || !account) {
      setError("Wallet not connected or provider unavailable");
      return;
    }

    setError(null); // Clear previous errors

    if (tab === "sell") {
      getUserTokenBalance();
    } else if (tab === "buy") {
      getUserEthBalance();
    }
  }, [tab, account, provider]);

  const handleTabChange = (newTab: string) => {
    setTab(newTab);
    setEthAmount(0);
    setTokenAmount(0);
    setEstimatedTokens(0);
    setEstimatedEth(0);
  };

  const getUserTokenBalance = async () => {
    if (!account || !provider || !contract) {
      setError("Wallet not connected or provider unavailable");
      return;
    }

    try {
      const balance = await contract.balanceOf(account);
      setTokenBalance(Number(ethers.formatUnits(balance, 18)));
    } catch (err) {
      console.error("Error fetching token balance:", err);
      setError("Failed to fetch token balance");
    }
  };

  const getUserEthBalance = async () => {
    if (!account || !provider) {
      setError("Wallet not connected or provider unavailable");
      return;
    }

    try {
      const balance = await provider.getBalance(account);
      setEthBalance(Number(ethers.formatEther(balance)));
    } catch (err) {
      console.error("Error fetching ETH balance:", err);
      setError("Failed to fetch ETH balance");
    }
  };

  const handleInputChange = async (value: number) => {
    if (!provider || !contract) {
      setError("Provider unavailable");
      return;
    }

    try {
      if (tab === "buy") {
        setEthAmount(value);
        const estimated = await contract.estimateBuy(
          ethers.parseEther(value.toString())
        );
        setEstimatedTokens(Number(ethers.formatUnits(estimated, 18)));
      } else {
        setTokenAmount(value);
        const estimated = await contract.estimateSell(
          ethers.parseUnits(value.toString(), 18)
        );
        setEstimatedEth(Number(ethers.formatEther(estimated)));
      }
    } catch (err) {
      console.error("Error calculating estimate:", err);
      setError("Failed to calculate estimate");
    }
  };

  const executeTrade = async () => {
    if (!account || !provider || !contract) {
      setError("Wallet not connected");
      return;
    }

    try {
      const signer = await provider.getSigner();
      const contractWithSigner = contract.connect(signer);
      const slippageAdjusted = slippage / 100;

      if (tab === "buy") {
        const minTokens = Math.floor(estimatedTokens * (1 - slippageAdjusted));
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await contractWithSigner.buy(minTokens, {
          value: ethers.parseEther(ethAmount.toFixed(18)),
        });
      } else {
        const minETH = ethers.parseEther(
          (estimatedEth * (1 - slippageAdjusted)).toFixed(18)
        );
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await contractWithSigner.sell(
          ethers.parseUnits(tokenAmount.toString(), 18),
          minETH
        );
      }
      setError(null); // Clear any previous error on success
    } catch (err) {
      console.error("Trade execution error:", err);
      setError("Trade execution failed");
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-md text-white border-2 border-gray-600 shadow-lg min-w-[360px] mb-4">
      {isMetaMaskError && (
        <p className="text-red-500 mb-4">
          MetaMask is not installed or unavailable.
        </p>
      )}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Tabs for Buy/Sell/Bridge */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => handleTabChange("buy")}
          className={`px-4 py-2 rounded transition-colors duration-150 w-1/3 ${
            tab === "buy"
              ? "bg-green-500 text-white"
              : "bg-gray-700 text-green-300"
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => handleTabChange("sell")}
          className={`px-4 py-2 rounded transition-colors duration-150 w-1/3 ${
            tab === "sell"
              ? "bg-red-500 text-white"
              : "bg-gray-700 text-red-300"
          }`}
        >
          Sell
        </button>
        <button
          onClick={() => setIsBridgeModalOpen(true)}
          className="px-4 py-2 rounded w-1/3 bg-blue-700 text-blue-300 hover:bg-blue-500 hover:text-white"
        >
          Bridge
        </button>
      </div>

      {/* Amount Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-400">
          {tab === "buy" ? "ETH Amount" : "Token Amount"}
        </label>
        <input
          type="number"
          value={tab === "buy" ? ethAmount : tokenAmount}
          onChange={(e) => handleInputChange(Number(e.target.value))}
          className="mt-1 block w-full border border-gray-500 rounded-md shadow-sm p-2 bg-gray-700 text-white"
          placeholder={
            tab === "buy" ? "Enter ETH amount" : "Enter token amount"
          }
        />
      </div>

      {/* Balance Display */}
      {tab === "buy" && (
        <div className="mb-4">
          <p className="text-sm text-gray-400">
            ETH Balance: {ethBalance.toFixed(4)}
          </p>
          <div className="flex justify-between mt-2">
            {[0.5, 0.1, 0.05, 0.01].map((amount) => (
              <button
                key={amount}
                onClick={() => setEthAmount(amount)}
                className="bg-gray-600 text-white py-1 px-2 mx-2 rounded-md text-sm hover:bg-gray-500"
              >
                {amount} ETH
              </button>
            ))}
          </div>
        </div>
      )}

      {tab === "sell" && (
        <div className="mb-4">
          <p className="text-sm text-gray-400">Token Balance: {tokenBalance}</p>
          <div className="flex justify-between mt-2">
            {[25, 50, 75, 100].map((percentage) => (
              <button
                key={percentage}
                onClick={() =>
                  setTokenAmount((tokenBalance * percentage) / 100)
                }
                className="bg-gray-600 text-white py-1 px-2 rounded-md text-sm hover:bg-gray-500"
              >
                {percentage}%
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Estimated Output */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-400">
          Estimated {tab === "buy" ? "Tokens" : "ETH"} (after {slippage}%
          slippage)
        </label>
        <p className="mt-1 text-lg">
          {tab === "buy" ? estimatedTokens : estimatedEth}
        </p>
      </div>

      {/* Slippage Control */}
      <div className="flex items-center mb-4">
        <label className="text-sm font-medium text-gray-400 mr-2">
          Set max slippage (%)
        </label>
        <input
          type="number"
          value={slippage}
          onChange={(e) => setSlippage(Number(e.target.value))}
          className="w-20 border border-gray-500 rounded-md p-1 bg-gray-700 text-white"
        />
      </div>

      {/* Execute Trade Button */}
      <button
        onClick={executeTrade}
        className={`w-full ${
          tab === "buy" ? "bg-green-500" : "bg-red-500"
        } text-white py-2 rounded-md font-bold`}
        disabled={!account || !provider || isMetaMaskError}
      >
        {tab === "buy" ? "Buy Tokens" : "Sell Tokens"}
      </button>

      {/* Bridge Modal */}
      {isBridgeModalOpen && (
        <BridgeModal
          isOpen={isBridgeModalOpen}
          onClose={() => setIsBridgeModalOpen(false)}
          chainId={network}
          tokenAddress={tokenAddress}
        />
      )}
    </div>
  );
};

export default TradePanel;
